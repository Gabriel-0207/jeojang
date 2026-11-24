import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { AuthLanding } from './components/AuthLanding';
import { Dashboard } from './components/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OnboardingSetup } from './components/OnboardingSetup';
import { auth, googleProvider } from './firebase';
import {
  completeStudentMission,
  createStudentProfileWithCharacter,
  resetStudentRecords,
  subscribeMissionLogs,
  subscribeStudentProfile,
  syncUserAccount,
  updateStudentIdentity,
} from './services/studentService';
import {
  createLockedCharacter,
  subscribeStudentCharacter,
} from './services/characterService';
import {
  subscribeStudyLogs,
  subscribeStudyNotes,
  subscribeStudyTasks,
} from './services/studyService';
import {
  CharacterBaseConfig,
  MissionDefinition,
  MissionLog,
  StudentCharacter,
  StudentProfile,
  StudyLog,
  StudyNote,
  StudyTask,
} from './types/student';

function AppShell() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const [studentLoading, setStudentLoading] = useState(false);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [logs, setLogs] = useState<MissionLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([]);
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>([]);
  const [studyNotes, setStudyNotes] = useState<StudyNote[]>([]);
  const [studyLoading, setStudyLoading] = useState(false);
  const [character, setCharacter] = useState<StudentCharacter | null>(null);
  const [characterLoading, setCharacterLoading] = useState(false);
  const [fatalError, setFatalError] = useState<Error | null>(null);

  if (fatalError) {
    throw fatalError;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);

      if (nextUser) {
        try {
          await syncUserAccount(nextUser);
        } catch (err) {
          setFatalError(err instanceof Error ? err : new Error(String(err)));
        }
      } else {
        setStudent(null);
        setLogs([]);
        setCharacter(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady || !user) return;

    setStudentLoading(true);
    let initialLoad = true;
    const unsubStudent = subscribeStudentProfile(
      user.uid,
      (profile) => {
        setStudent(profile);
        if (initialLoad) {
          initialLoad = false;
          setStudentLoading(false);
        }
      },
      (err) => {
        setStudentLoading(false);
        setFatalError(err);
      }
    );

    return () => unsubStudent();
  }, [authReady, user]);

  useEffect(() => {
    if (!authReady || !user || !student) {
      setLogs([]);
      return;
    }

    setLogsLoading(true);
    const unsubLogs = subscribeMissionLogs(
      user.uid,
      (nextLogs) => {
        setLogs(nextLogs);
        setLogsLoading(false);
      },
      (err) => {
        setLogsLoading(false);
        setFatalError(err);
      }
    );

    return () => unsubLogs();
  }, [authReady, user, student?.uid]);

  useEffect(() => {
    if (!authReady || !user || !student) {
      setStudyLogs([]);
      setStudyTasks([]);
      setStudyNotes([]);
      return;
    }

    setStudyLoading(true);
    let logsLoaded = false;
    let tasksLoaded = false;
    let notesLoaded = false;
    const markReady = () => {
      if (logsLoaded && tasksLoaded && notesLoaded) {
        setStudyLoading(false);
      }
    };

    const unsubStudyLogs = subscribeStudyLogs(
      user.uid,
      (items) => {
        setStudyLogs(items);
        logsLoaded = true;
        markReady();
      },
      (err) => {
        setStudyLoading(false);
        setFatalError(err);
      }
    );

    const unsubStudyTasks = subscribeStudyTasks(
      user.uid,
      (items) => {
        setStudyTasks(items);
        tasksLoaded = true;
        markReady();
      },
      (err) => {
        setStudyLoading(false);
        setFatalError(err);
      }
    );

    const unsubStudyNotes = subscribeStudyNotes(
      user.uid,
      (items) => {
        setStudyNotes(items);
        notesLoaded = true;
        markReady();
      },
      (err) => {
        setStudyLoading(false);
        setFatalError(err);
      }
    );

    return () => {
      unsubStudyLogs();
      unsubStudyTasks();
      unsubStudyNotes();
    };
  }, [authReady, user, student?.uid]);

  useEffect(() => {
    if (!authReady || !user || !student) {
      setCharacter(null);
      setCharacterLoading(false);
      return;
    }

    setCharacterLoading(true);
    let initialLoad = true;
    const unsubCharacter = subscribeStudentCharacter(
      user.uid,
      (nextCharacter) => {
        setCharacter(nextCharacter);
        if (initialLoad) {
          initialLoad = false;
          setCharacterLoading(false);
        }
      },
      (err) => {
        setCharacterLoading(false);
        setFatalError(err);
      }
    );

    return () => unsubCharacter();
  }, [authReady, user, student?.uid]);

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('popup-closed-by-user')) {
        setAuthError('구글 로그인 창이 닫혔습니다. 다시 시도해 주세요.');
      } else if (msg.includes('unauthorized-domain')) {
        setAuthError(
          '현재 배포 도메인이 Firebase 승인 도메인에 등록되지 않았습니다. Firebase 콘솔 > Authentication > 설정 > 승인된 도메인에 Vercel 주소를 추가해 주세요.'
        );
      } else {
        setAuthError('구글 로그인에 실패했습니다. 팝업 허용 여부를 확인한 뒤 다시 시도해 주세요.');
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleCreateStudentWithCharacter = async (
    studentNumber: string,
    name: string,
    charConfig: CharacterBaseConfig
  ) => {
    if (!user) return;
    await createStudentProfileWithCharacter(user.uid, studentNumber, name, charConfig);
  };

  const handleCreateCharacterOnly = async (charConfig: CharacterBaseConfig) => {
    if (!user) return;
    await createLockedCharacter(user.uid, charConfig);
  };

  const handleUpdateIdentity = async (studentNumber: string, name: string) => {
    if (!user) return;
    await updateStudentIdentity(user.uid, studentNumber, name);
  };

  const handleResetRecords = async (includeProfile: boolean) => {
    if (!user) return;
    await resetStudentRecords(user.uid, includeProfile);
    if (includeProfile) {
      setStudent(null);
      setLogs([]);
      setStudyLogs([]);
      setStudyTasks([]);
      setStudyNotes([]);
      setCharacter(null);
      await signOut(auth);
    }
  };

  const handleCompleteMission = async (mission: MissionDefinition, note: string) => {
    if (!student) {
      throw new Error('학생 프로필을 불러오는 중입니다.');
    }
    return completeStudentMission(student, mission, note);
  };

  if (!authReady || (user && (studentLoading || (student && characterLoading)))) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white border border-slate-200 rounded-xl p-8 text-center">
          <div className="w-8 h-8 border-2 border-[#1B365D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-800">학생 정보를 불러오고 있습니다</p>
          <p className="text-xs text-slate-500 mt-1">목포덕인고등학교 능력치 시스템</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthLanding onGoogleLogin={handleGoogleLogin} error={authError} />;
  }

  if (!student) {
    return (
      <OnboardingSetup
        mode="full"
        userEmail={user.email ?? ''}
        defaultName={user.displayName ?? ''}
        onSubmitFull={handleCreateStudentWithCharacter}
        onResetAccount={() => handleResetRecords(true)}
        onLogout={handleLogout}
      />
    );
  }

  if (!character || !character.locked) {
    return (
      <OnboardingSetup
        mode="character-only"
        userEmail={user.email ?? ''}
        defaultName={student.name}
        existingStudentNumber={student.studentNumber}
        onSubmitCharacterOnly={handleCreateCharacterOnly}
        onResetAccount={() => handleResetRecords(true)}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <Dashboard
      student={student}
      character={character}
      userEmail={user.email ?? ''}
      logs={logs}
      logsLoading={logsLoading}
      studyLogs={studyLogs}
      studyTasks={studyTasks}
      studyNotes={studyNotes}
      studyLoading={studyLoading}
      onCompleteMission={handleCompleteMission}
      onUpdateIdentity={handleUpdateIdentity}
      onResetRecords={handleResetRecords}
      onLogout={handleLogout}
    />
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppShell />
    </ErrorBoundary>
  );
}
