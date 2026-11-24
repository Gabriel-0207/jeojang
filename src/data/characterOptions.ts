import {
  CharacterBaseConfig,
  CharacterEyeStyle,
  CharacterHairColor,
  CharacterHairStyle,
  CharacterSkinId,
  CharacterSkinTone,
} from '../types/student';

export const SKIN_TONE_OPTIONS: {
  id: CharacterSkinTone;
  label: string;
  fill: string;
  shade: string;
  outline: string;
}[] = [
  { id: 'fair', label: '맑은 피부', fill: '#FDE7D6', shade: '#ECC4A8', outline: '#181425' },
  { id: 'warm', label: '자연 웜톤', fill: '#F2C59F', shade: '#D49E72', outline: '#181425' },
  { id: 'tan', label: '모험가 탠', fill: '#D9A073', shade: '#B67B4F', outline: '#181425' },
  { id: 'deep', label: '브론즈 톤', fill: '#AE724C', shade: '#8A5332', outline: '#181425' },
];

export const HAIR_STYLE_OPTIONS: { id: CharacterHairStyle; label: string }[] = [
  { id: 'short_neat', label: '단정 숏컷' },
  { id: 'two_block', label: '댄디 투블럭' },
  { id: 'parted_curtain', label: '가르마 펌' },
  { id: 'wavy_bob', label: '단발 웨이브' },
  { id: 'long_straight', label: '긴 생머리' },
  { id: 'ponytail', label: '포니테일' },
];

export const HAIR_COLOR_OPTIONS: {
  id: CharacterHairColor;
  label: string;
  fill: string;
  highlight: string;
}[] = [
  { id: 'black', label: '칠흑 블랙', fill: '#232732', highlight: '#4B5164' },
  { id: 'dark_brown', label: '다크 브라운', fill: '#4A2E24', highlight: '#7B5040' },
  { id: 'chestnut', label: '체스트넛', fill: '#854B2A', highlight: '#BC7446' },
  { id: 'blonde', label: '허니 블론드', fill: '#D4A13E', highlight: '#F3CB6E' },
  { id: 'crimson_red', label: '와인 크림슨', fill: '#7F1D2C', highlight: '#B9384D' },
  { id: 'navy_tint', label: '덕인 네이비', fill: '#1D3B6B', highlight: '#426DB3' },
  { id: 'emerald_tint', label: '딥 에메랄드', fill: '#185447', highlight: '#348A76' },
  { id: 'violet_plum', label: '다크 바이올렛', fill: '#4C2B6E', highlight: '#7F52AB' },
  { id: 'ash_gray', label: '실버 애쉬', fill: '#6D798D', highlight: '#A8B5C9' },
  { id: 'platinum', label: '플래티넘 화이트', fill: '#C4CBD8', highlight: '#EEF2F8' },
];

export const EYE_STYLE_OPTIONS: {
  id: CharacterEyeStyle;
  label: string;
  iris: string;
  glint: string;
}[] = [
  { id: 'bright', label: '골드 옐로우', iris: '#EAB308', glint: '#FEF9C3' },
  { id: 'calm', label: '사파이어 블루', iris: '#38BDF8', glint: '#E0F2FE' },
  { id: 'smile', label: '에메랄드 그린', iris: '#34D399', glint: '#D1FAE5' },
  { id: 'focused', label: '크림슨 레드', iris: '#EF4444', glint: '#FEE2E2' },
  { id: 'wink', label: '아메시스트 퍼플', iris: '#A855F7', glint: '#F3E8FF' },
  { id: 'amber_orange', label: '선셋 앰버', iris: '#F97316', glint: '#FFEDD5' },
  { id: 'rose_pink', label: '체리 로즈', iris: '#EC4899', glint: '#FCE7F3' },
  { id: 'teal_mint', label: '아쿠아 민트', iris: '#14B8A6', glint: '#CCFBF1' },
  { id: 'silver_ice', label: '실버 아이스', iris: '#CBD5E1', glint: '#F8FAFC' },
  { id: 'obsidian_dark', label: '딥 브라운', iris: '#6B4226', glint: '#E7D3C0' },
];

export interface CharacterSkinDefinition {
  id: CharacterSkinId;
  name: string;
  tier: '기본' | '일반' | '희귀' | '영웅' | '전설';
  price: number;
  description: string;
  equipmentSummary: string;
  bgTop: string;
  bgBottom: string;
  floorTop: string;
  floorSide: string;
  auraColor?: string;
}

export const CHARACTER_SKINS: CharacterSkinDefinition[] = [
  {
    id: 'novice_uniform',
    name: '덕인 기본 교복',
    tier: '기본',
    price: 0,
    description: '목포덕인고등학교 입학생에게 기본 지급되는 화이트 셔츠와 다크 스쿨 베스트, 빨간 넥타이, 회색 교복바지 차림의 단정한 기본 교복입니다.',
    equipmentSummary: '다크 스쿨 베스트 · 빨간 넥타이 · 회색 교복바지',
    bgTop: '#F1F5F9',
    bgBottom: '#E2E8F0',
    floorTop: '#4A405A',
    floorSide: '#352D42',
  },
  {
    id: 'track_runner',
    name: '체육부 트랙 저지',
    tier: '일반',
    price: 60,
    description: '활동적인 학교 체육·동아리 시간에 어울리는 청록 투톤 트랙 자켓과 스포츠 헤어밴드 스타일입니다.',
    equipmentSummary: '스포츠 헤어밴드 · 청록 트랙 집업 · 러닝 스니커즈',
    bgTop: '#F0FDFA',
    bgBottom: '#CCFBF1',
    floorTop: '#2E5461',
    floorSide: '#1F3B45',
  },
  {
    id: 'arcane_scholar',
    name: '도서관 지성 코트',
    tier: '일반',
    price: 100,
    description: '인디고 롱 코트와 니트 머플러, 둥근 금테 안경으로 차분한 학구열을 표현한 캠퍼스 룩입니다.',
    equipmentSummary: '금테 안경 · 인디고 롱 코트 · 니트 머플러',
    bgTop: '#EEF2FF',
    bgBottom: '#E0E7FF',
    floorTop: '#3E4170',
    floorSide: '#2C2E52',
    auraColor: '#818CF8',
  },
  {
    id: 'crimson_knight',
    name: '크림슨 바시티 자켓',
    tier: '희귀',
    price: 150,
    description: '진홍과 차콜 배색의 스쿨 바시티 점퍼에 후드를 레이어드한 경쾌하고 강렬한 동아리 룩입니다.',
    equipmentSummary: '후드 레이어드 · 진홍 바시티 자켓 · 워커 부츠',
    bgTop: '#FFF1F2',
    bgBottom: '#FFE4E6',
    floorTop: '#5E3847',
    floorSide: '#422531',
    auraColor: '#FB7185',
  },
  {
    id: 'emerald_archer',
    name: '캠퍼스 아웃도어 파카',
    tier: '희귀',
    price: 180,
    description: '숲빛 에메랄드 후드 파카와 크로스 메신저백 스트랩으로 실용성과 멋을 살린 스타일입니다.',
    equipmentSummary: '에메랄드 후드 파카 · 크로스 스트랩 · 아웃도어 팬츠',
    bgTop: '#ECFDF5',
    bgBottom: '#D1FAE5',
    floorTop: '#325947',
    floorSide: '#223E31',
    auraColor: '#34D399',
  },
  {
    id: 'valkyrie_gold',
    name: '덕인 골드 명예 정복',
    tier: '영웅',
    price: 240,
    description: '황금빛 견장과 날개 엠블럼 브로치가 돋보이는 진홍·흑금 포인트의 학교 명예 학생 정복입니다.',
    equipmentSummary: '골드 윙 라펠 브로치 · 진홍 흑금 정복 · 금빛 견장',
    bgTop: '#FFFBEB',
    bgBottom: '#FEF3C7',
    floorTop: '#524663',
    floorSide: '#3A3047',
    auraColor: '#FACC15',
  },
  {
    id: 'royal_paladin',
    name: '로열 아이비 프레피',
    tier: '영웅',
    price: 320,
    description: '화이트와 로열 블루 배색의 고급 프레피 블레이저에 사파이어 타이 핀을 매치한 스타일입니다.',
    equipmentSummary: '사파이어 타이 핀 · 화이트 블루 블레이저 · 클래식 로퍼',
    bgTop: '#EFF6FF',
    bgBottom: '#DBEAFE',
    floorTop: '#3B517A',
    floorSide: '#283857',
    auraColor: '#60A5FA',
  },
  {
    id: 'celestial_lord',
    name: '미드나잇 아스트랄 코트',
    tier: '전설',
    price: 450,
    description: '밤하늘 같은 딥 인디고 코트에 금사 자수와 별빛 스카프를 두른 최고 등급 스페셜 의상입니다.',
    equipmentSummary: '별빛 헤어 클립 · 금사 자수 롱 코트 · 아스트랄 스카프',
    bgTop: '#171126',
    bgBottom: '#2A1D42',
    floorTop: '#5A437A',
    floorSide: '#3E2D57',
    auraColor: '#FDE047',
  },
];

export const SKIN_MAP: Record<CharacterSkinId, CharacterSkinDefinition> = CHARACTER_SKINS.reduce(
  (acc, skin) => {
    acc[skin.id] = skin;
    return acc;
  },
  {} as Record<CharacterSkinId, CharacterSkinDefinition>
);

export function getDefaultCharacterBaseConfig(studentName: string): CharacterBaseConfig {
  return {
    nickname: studentName.trim().slice(0, 24) || '덕인 히어로',
    motto: '오늘의 작은 실천이 내일의 실력이 된다',
    skinTone: 'warm',
    hairStyle: 'two_block',
    hairColor: 'black',
    eyeStyle: 'bright',
  };
}

export function createRandomCharacterBaseConfig(currentNickname: string): CharacterBaseConfig {
  const pick = <T,>(arr: readonly { id: T }[]): T =>
    arr[Math.floor(Math.random() * arr.length)].id;

  const sampleMottos = [
    '매일 1%씩 꾸준히 성장하는 목포덕인인',
    '지성과 체력이 조화로운 학교생활 만들기',
    '배움은 깊게, 도전은 즐겁게',
    '함께 성장하고 신뢰를 쌓는 하루',
    '어제보다 나은 오늘의 나를 기록하다',
  ];

  return {
    nickname: currentNickname.trim().slice(0, 24) || '덕인 챌린저',
    motto: sampleMottos[Math.floor(Math.random() * sampleMottos.length)],
    skinTone: pick(SKIN_TONE_OPTIONS),
    hairStyle: 'two_block',
    hairColor: pick(HAIR_COLOR_OPTIONS),
    eyeStyle: pick(EYE_STYLE_OPTIONS),
  };
}
