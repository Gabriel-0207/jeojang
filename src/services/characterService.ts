import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { CharacterSkinDefinition } from '../data/characterOptions';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  CharacterBaseConfig,
  CharacterSkinId,
  StudentCharacter,
  StudentProfile,
} from '../types/student';

export function subscribeStudentCharacter(
  uid: string,
  onData: (character: StudentCharacter | null) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `students/${uid}/character/main`;
  const charRef = doc(db, 'students', uid, 'character', 'main');

  return onSnapshot(
    charRef,
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      const raw = snap.data() as Partial<StudentCharacter>;
      onData({
        uid: raw.uid ?? uid,
        nickname: raw.nickname ?? '덕인 히어로',
        motto: raw.motto ?? '',
        skinTone: raw.skinTone ?? 'warm',
        hairStyle: raw.hairStyle ?? 'two_block',
        hairColor: raw.hairColor ?? 'black',
        eyeStyle: raw.eyeStyle ?? 'bright',
        equippedSkin: raw.equippedSkin ?? 'novice_uniform',
        ownedSkins:
          Array.isArray(raw.ownedSkins) && raw.ownedSkins.length > 0
            ? raw.ownedSkins
            : ['novice_uniform'],
        locked: raw.locked === true,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      });
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

export async function createLockedCharacter(
  uid: string,
  config: CharacterBaseConfig
): Promise<void> {
  const cleanNickname = config.nickname.trim().slice(0, 24);
  const cleanMotto = config.motto.trim().slice(0, 60);

  if (!cleanNickname) {
    throw new Error('캐릭터 별명을 1~24자 이내로 입력해 주세요.');
  }

  const path = `students/${uid}/character/main`;
  const charRef = doc(db, 'students', uid, 'character', 'main');

  try {
    const existing = await getDoc(charRef);
    if (existing.exists() && existing.data()?.locked === true) {
      throw new Error('이미 생성되어 영구 확정된 캐릭터는 변경할 수 없습니다.');
    }

    const basePayload = {
      nickname: cleanNickname,
      motto: cleanMotto,
      skinTone: config.skinTone,
      hairStyle: config.hairStyle,
      hairColor: config.hairColor,
      eyeStyle: config.eyeStyle,
      equippedSkin: 'novice_uniform' as CharacterSkinId,
      ownedSkins: ['novice_uniform'] as CharacterSkinId[],
      locked: true,
      updatedAt: serverTimestamp(),
    };

    if (!existing.exists()) {
      await setDoc(charRef, {
        uid,
        ...basePayload,
        createdAt: serverTimestamp(),
      });
    } else {
      await setDoc(charRef, {
        uid,
        ...basePayload,
        createdAt: existing.data()?.createdAt ?? serverTimestamp(),
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('영구 확정된')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function equipCharacterSkin(
  uid: string,
  skinId: CharacterSkinId,
  ownedSkins: CharacterSkinId[]
): Promise<void> {
  if (!ownedSkins.includes(skinId)) {
    throw new Error('보유하지 않은 스킨입니다. 상점에서 먼저 구매해 주세요.');
  }

  const path = `students/${uid}/character/main`;
  const charRef = doc(db, 'students', uid, 'character', 'main');

  try {
    await updateDoc(charRef, {
      equippedSkin: skinId,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function purchaseCharacterSkin(
  student: StudentProfile,
  character: StudentCharacter,
  skin: CharacterSkinDefinition
): Promise<void> {
  if (character.ownedSkins.includes(skin.id)) {
    throw new Error('이미 보유 중인 스킨입니다.');
  }

  const currentPoints = student.points ?? 0;
  if (currentPoints < skin.price) {
    throw new Error(`포인트가 부족합니다. (필요: ${skin.price}P / 보유: ${currentPoints}P)`);
  }

  const path = `students/${student.uid}/character/main`;
  const studentRef = doc(db, 'students', student.uid);
  const charRef = doc(db, 'students', student.uid, 'character', 'main');

  const nextPoints = currentPoints - skin.price;
  const nextOwned = [...character.ownedSkins, skin.id].slice(0, 16);

  const batch = writeBatch(db);
  batch.update(studentRef, {
    points: nextPoints,
    updatedAt: serverTimestamp(),
  });
  batch.update(charRef, {
    ownedSkins: nextOwned,
    equippedSkin: skin.id,
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
