import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getCurrentDailyKey } from '../data/missions';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { StudyLog, StudyNote, StudySubject, StudyTask } from '../types/student';

export const STUDY_SUBJECTS: StudySubject[] = [
  '국어',
  '수학',
  '영어',
  '한국사/사회',
  '과학',
  '기타',
];

function getTimestampSeconds(
  val?: { seconds: number; nanoseconds: number } | Date | null
): number {
  if (!val) return 0;
  if (val instanceof Date) return val.getTime() / 1000;
  if (typeof val === 'object' && 'seconds' in val) return val.seconds;
  return 0;
}

export function subscribeStudyLogs(
  uid: string,
  onData: (items: StudyLog[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `students/${uid}/studyLogs`;
  const q = query(collection(db, 'students', uid, 'studyLogs'), where('uid', '==', uid), limit(80));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<StudyLog, 'id'>) }))
        .sort((a, b) => getTimestampSeconds(b.createdAt) - getTimestampSeconds(a.createdAt));
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

export function subscribeStudyTasks(
  uid: string,
  onData: (items: StudyTask[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `students/${uid}/studyTasks`;
  const q = query(collection(db, 'students', uid, 'studyTasks'), where('uid', '==', uid), limit(100));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<StudyTask, 'id'>) }))
        .sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          return getTimestampSeconds(b.createdAt) - getTimestampSeconds(a.createdAt);
        });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

export function subscribeStudyNotes(
  uid: string,
  onData: (items: StudyNote[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `students/${uid}/studyNotes`;
  const q = query(collection(db, 'students', uid, 'studyNotes'), where('uid', '==', uid), limit(100));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<StudyNote, 'id'>) }))
        .sort((a, b) => getTimestampSeconds(b.createdAt) - getTimestampSeconds(a.createdAt));
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

export async function addStudyLog(
  uid: string,
  subject: StudySubject,
  topic: string,
  minutes: number
): Promise<void> {
  const cleanTopic = topic.trim().slice(0, 100);
  const clampedMinutes = Math.max(1, Math.min(300, Math.round(minutes)));
  if (!cleanTopic) {
    throw new Error('학습 주제를 1자 이상 입력해 주세요.');
  }

  const logId = `slog_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const path = `students/${uid}/studyLogs/${logId}`;
  try {
    await setDoc(doc(db, 'students', uid, 'studyLogs', logId), {
      uid,
      subject,
      topic: cleanTopic,
      minutes: clampedMinutes,
      dateKey: getCurrentDailyKey(),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteStudyLog(uid: string, logId: string): Promise<void> {
  const path = `students/${uid}/studyLogs/${logId}`;
  try {
    await deleteDoc(doc(db, 'students', uid, 'studyLogs', logId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function addStudyTask(
  uid: string,
  subject: StudySubject,
  title: string
): Promise<void> {
  const cleanTitle = title.trim().slice(0, 100);
  if (!cleanTitle) {
    throw new Error('학습 목표 내용을 입력해 주세요.');
  }

  const taskId = `stask_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const path = `students/${uid}/studyTasks/${taskId}`;
  try {
    await setDoc(doc(db, 'students', uid, 'studyTasks', taskId), {
      uid,
      subject,
      title: cleanTitle,
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function toggleStudyTask(
  uid: string,
  taskId: string,
  nextCompleted: boolean
): Promise<void> {
  const path = `students/${uid}/studyTasks/${taskId}`;
  try {
    await updateDoc(doc(db, 'students', uid, 'studyTasks', taskId), {
      completed: nextCompleted,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteStudyTask(uid: string, taskId: string): Promise<void> {
  const path = `students/${uid}/studyTasks/${taskId}`;
  try {
    await deleteDoc(doc(db, 'students', uid, 'studyTasks', taskId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function addStudyNote(
  uid: string,
  subject: StudySubject,
  title: string,
  content: string
): Promise<void> {
  const cleanTitle = title.trim().slice(0, 80);
  const cleanContent = content.trim().slice(0, 500);
  if (!cleanTitle || !cleanContent) {
    throw new Error('제목과 핵심 정리 내용을 모두 입력해 주세요.');
  }

  const noteId = `snote_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const path = `students/${uid}/studyNotes/${noteId}`;
  try {
    await setDoc(doc(db, 'students', uid, 'studyNotes', noteId), {
      uid,
      subject,
      title: cleanTitle,
      content: cleanContent,
      reviewed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function toggleStudyNoteReviewed(
  uid: string,
  noteId: string,
  nextReviewed: boolean
): Promise<void> {
  const path = `students/${uid}/studyNotes/${noteId}`;
  try {
    await updateDoc(doc(db, 'students', uid, 'studyNotes', noteId), {
      reviewed: nextReviewed,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteStudyNote(uid: string, noteId: string): Promise<void> {
  const path = `students/${uid}/studyNotes/${noteId}`;
  try {
    await deleteDoc(doc(db, 'students', uid, 'studyNotes', noteId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
