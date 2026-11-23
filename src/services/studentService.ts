import { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  calculateGradeForScore,
  calculateTotalScore,
  getCurrentDailyKey,
  getCurrentMonthlyKey,
  getCurrentWeeklyKey,
  getEffectiveCompletedIds,
  INITIAL_STATS,
  MAX_STAT_VALUE,
} from '../data/missions';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  GradeRank,
  MissionDefinition,
  MissionLog,
  StudentProfile,
  StudentStats,
} from '../types/student';

export const STUDENT_NUMBER_REGEX = /^[0-9A-Za-z가-힣\-\s]{2,20}$/;

export function validateStudentInput(studentNumber: string, name: string): {
  valid: boolean;
  message?: string;
  cleanNumber: string;
  cleanName: string;
} {
  const cleanNumber = studentNumber.trim().slice(0, 20);
  const cleanName = name.trim().slice(0, 30);

  if (cleanNumber.length < 2 || !STUDENT_NUMBER_REGEX.test(cleanNumber)) {
    return {
      valid: false,
      message: '학번은 2~20자의 숫자, 한글, 영문 또는 하이픈(-)으로 입력해 주세요. (예: 10315)',
      cleanNumber,
      cleanName,
    };
  }

  if (cleanName.length < 1 || cleanName.length > 30) {
    return {
      valid: false,
      message: '이름은 1~30자 이내로 입력해 주세요.',
      cleanNumber,
      cleanName,
    };
  }

  return { valid: true, cleanNumber, cleanName };
}

export async function syncUserAccount(user: User): Promise<void> {
  const userPath = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);
  const email = (user.email ?? '').trim().slice(0, 200);
  const displayName = (user.displayName ?? '').trim().slice(0, 100);
  const photoURL = (user.photoURL ?? '').trim().slice(0, 500);

  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email,
        displayName,
        photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(userRef, {
        email,
        displayName,
        photoURL,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

export async function createStudentProfile(
  uid: string,
  studentNumber: string,
  name: string
): Promise<void> {
  const validation = validateStudentInput(studentNumber, name);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const path = `students/${uid}`;
  const studentRef = doc(db, 'students', uid);

  try {
    const totalScore = calculateTotalScore(INITIAL_STATS);
    await setDoc(studentRef, {
      uid,
      studentNumber: validation.cleanNumber,
      name: validation.cleanName,
      grade: 'E' as GradeRank,
      totalScore,
      completedCount: 0,
      stats: { ...INITIAL_STATS },
      dailyKey: getCurrentDailyKey(),
      dailyCompleted: [],
      weeklyKey: getCurrentWeeklyKey(),
      weeklyCompleted: [],
      monthlyKey: getCurrentMonthlyKey(),
      monthlyCompleted: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateStudentIdentity(
  uid: string,
  studentNumber: string,
  name: string
): Promise<void> {
  const validation = validateStudentInput(studentNumber, name);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const path = `students/${uid}`;
  const studentRef = doc(db, 'students', uid);

  try {
    await updateDoc(studentRef, {
      studentNumber: validation.cleanNumber,
      name: validation.cleanName,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function completeStudentMission(
  student: StudentProfile,
  mission: MissionDefinition,
  rawNote = ''
): Promise<{ previousGrade: GradeRank; nextGrade: GradeRank; promoted: boolean }> {
  const currentDailyKey = getCurrentDailyKey();
  const currentWeeklyKey = getCurrentWeeklyKey();
  const currentMonthlyKey = getCurrentMonthlyKey();

  const dailyCompleted = getEffectiveCompletedIds(
    'daily',
    student.dailyKey,
    student.dailyCompleted
  );
  const weeklyCompleted = getEffectiveCompletedIds(
    'weekly',
    student.weeklyKey,
    student.weeklyCompleted
  );
  const monthlyCompleted = getEffectiveCompletedIds(
    'monthly',
    student.monthlyKey,
    student.monthlyCompleted
  );

  if (mission.period === 'daily' && dailyCompleted.includes(mission.id)) {
    throw new Error('이미 오늘 완료한 일일 임무입니다.');
  }
  if (mission.period === 'weekly' && weeklyCompleted.includes(mission.id)) {
    throw new Error('이미 이번 주에 완료한 주간 임무입니다.');
  }
  if (mission.period === 'monthly' && monthlyCompleted.includes(mission.id)) {
    throw new Error('이미 이번 달에 완료한 월간 임무입니다.');
  }

  const nextStats: StudentStats = {
    academics: Math.min(MAX_STAT_VALUE, student.stats.academics + (mission.statGains.academics ?? 0)),
    fitness: Math.min(MAX_STAT_VALUE, student.stats.fitness + (mission.statGains.fitness ?? 0)),
    social: Math.min(MAX_STAT_VALUE, student.stats.social + (mission.statGains.social ?? 0)),
    leadership: Math.min(MAX_STAT_VALUE, student.stats.leadership + (mission.statGains.leadership ?? 0)),
    creativity: Math.min(MAX_STAT_VALUE, student.stats.creativity + (mission.statGains.creativity ?? 0)),
    mental: Math.min(MAX_STAT_VALUE, student.stats.mental + (mission.statGains.mental ?? 0)),
  };

  const nextTotalScore = student.totalScore + mission.totalGain;
  const nextGrade = calculateGradeForScore(nextTotalScore);
  const previousGrade = student.grade;

  const nextDaily =
    mission.period === 'daily' ? [...dailyCompleted, mission.id].slice(0, 12) : dailyCompleted;
  const nextWeekly =
    mission.period === 'weekly' ? [...weeklyCompleted, mission.id].slice(0, 6) : weeklyCompleted;
  const nextMonthly =
    mission.period === 'monthly'
      ? [...monthlyCompleted, mission.id].slice(0, 3)
      : monthlyCompleted;

  const periodKey =
    mission.period === 'daily'
      ? currentDailyKey
      : mission.period === 'weekly'
        ? currentWeeklyKey
        : currentMonthlyKey;

  const cleanNote = rawNote.trim().slice(0, 150);
  const logId = `${mission.id}_${Date.now()}`;
  const studentRef = doc(db, 'students', student.uid);
  const logRef = doc(db, 'students', student.uid, 'logs', logId);

  const batch = writeBatch(db);
  batch.update(studentRef, {
    grade: nextGrade,
    totalScore: nextTotalScore,
    completedCount: student.completedCount + 1,
    stats: nextStats,
    dailyKey: currentDailyKey,
    dailyCompleted: nextDaily,
    weeklyKey: currentWeeklyKey,
    weeklyCompleted: nextWeekly,
    monthlyKey: currentMonthlyKey,
    monthlyCompleted: nextMonthly,
    updatedAt: serverTimestamp(),
  });

  batch.set(logRef, {
    uid: student.uid,
    missionId: mission.id.slice(0, 40),
    missionTitle: mission.title.slice(0, 100),
    period: mission.period,
    periodKey,
    totalGain: mission.totalGain,
    note: cleanNote,
    createdAt: serverTimestamp(),
  });

  try {
    await batch.commit();
    return {
      previousGrade,
      nextGrade,
      promoted: previousGrade !== nextGrade,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `students/${student.uid}`);
  }
}

export async function resetStudentRecords(
  uid: string,
  includeProfile = false
): Promise<void> {
  const studentPath = `students/${uid}`;
  const studentRef = doc(db, 'students', uid);
  const subcollections = ['logs', 'studyLogs', 'studyTasks', 'studyNotes'] as const;
  for (const sub of subcollections) {
    const subPath = `students/${uid}/${sub}`;
    try {
      const subQuery = query(collection(db, 'students', uid, sub), where('uid', '==', uid));
      const subSnap = await getDocs(subQuery);
      const docs = subSnap.docs;
      for (let i = 0; i < docs.length; i += 400) {
        const batch = writeBatch(db);
        docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, subPath);
    }
  }

  try {
    if (includeProfile) {
      const batch = writeBatch(db);
      batch.delete(studentRef);
      await batch.commit();
    } else {
      const totalScore = calculateTotalScore(INITIAL_STATS);
      await updateDoc(studentRef, {
        grade: 'E' as GradeRank,
        totalScore,
        completedCount: 0,
        stats: { ...INITIAL_STATS },
        dailyKey: getCurrentDailyKey(),
        dailyCompleted: [],
        weeklyKey: getCurrentWeeklyKey(),
        weeklyCompleted: [],
        monthlyKey: getCurrentMonthlyKey(),
        monthlyCompleted: [],
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, includeProfile ? OperationType.DELETE : OperationType.UPDATE, studentPath);
  }
}

export function subscribeStudentProfile(
  uid: string,
  onData: (profile: StudentProfile | null) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `students/${uid}`;
  const studentRef = doc(db, 'students', uid);

  return onSnapshot(
    studentRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }
      onData(snapshot.data() as StudentProfile);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

export function subscribeMissionLogs(
  uid: string,
  onData: (logs: MissionLog[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `students/${uid}/logs`;
  const logsQuery = query(
    collection(db, 'students', uid, 'logs'),
    where('uid', '==', uid),
    limit(60)
  );

  return onSnapshot(
    logsQuery,
    (snapshot) => {
      const items: MissionLog[] = snapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<MissionLog, 'id'>),
        }))
        .sort((a, b) => {
          const getSec = (val: MissionLog['createdAt']) => {
            if (!val) return 0;
            if (val instanceof Date) return val.getTime() / 1000;
            if (typeof val === 'object' && 'seconds' in val) return val.seconds;
            return 0;
          };
          return getSec(b.createdAt) - getSec(a.createdAt);
        });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}
