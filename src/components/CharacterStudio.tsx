import { useMemo, useState } from 'react';
import { Check, Coins, Eye, Lock, ShoppingBag, ShieldCheck } from 'lucide-react';
import {
  CHARACTER_SKINS,
  CharacterSkinDefinition,
  EYE_STYLE_OPTIONS,
  HAIR_COLOR_OPTIONS,
  SKIN_MAP,
  SKIN_TONE_OPTIONS,
} from '../data/characterOptions';
import { STAT_LABEL_MAP } from '../data/missions';
import { equipCharacterSkin, purchaseCharacterSkin } from '../services/characterService';
import {
  CharacterSkinId,
  StatKey,
  StudentCharacter,
  StudentProfile,
} from '../types/student';
import { CharacterAvatar } from './CharacterAvatar';

interface CharacterStudioProps {
  student: StudentProfile;
  character: StudentCharacter;
  onGoToMissions: () => void;
  onBackToDashboard: () => void;
}

type ShopTab = 'shop' | 'wardrobe';

export function CharacterStudio({
  student,
  character,
  onGoToMissions,
  onBackToDashboard,
}: CharacterStudioProps) {
  const [activeTab, setActiveTab] = useState<ShopTab>('shop');
  const [previewSkinId, setPreviewSkinId] = useState<CharacterSkinId | null>(null);
  const [busySkinId, setBusySkinId] = useState<CharacterSkinId | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displaySkinId = previewSkinId ?? character.equippedSkin;
  const displaySkin = SKIN_MAP[displaySkinId] ?? SKIN_MAP.novice_uniform;
  const equippedSkin = SKIN_MAP[character.equippedSkin] ?? SKIN_MAP.novice_uniform;

  const topStat = useMemo(() => {
    const entries = Object.entries(student.stats) as [StatKey, number][];
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0];
  }, [student.stats]);

  const skinToneLabel =
    SKIN_TONE_OPTIONS.find((s) => s.id === character.skinTone)?.label ?? '-';
  const hairColorLabel =
    HAIR_COLOR_OPTIONS.find((c) => c.id === character.hairColor)?.label ?? '-';
  const eyeLabel =
    EYE_STYLE_OPTIONS.find((e) => e.id === character.eyeStyle)?.label ?? '-';

  const displayedSkins = useMemo(() => {
    if (activeTab === 'wardrobe') {
      return CHARACTER_SKINS.filter((skin) => character.ownedSkins.includes(skin.id));
    }
    return CHARACTER_SKINS;
  }, [activeTab, character.ownedSkins]);

  const handleEquip = async (skin: CharacterSkinDefinition) => {
    setError(null);
    setFeedback(null);
    setBusySkinId(skin.id);
    try {
      await equipCharacterSkin(student.uid, skin.id, character.ownedSkins);
      setPreviewSkinId(null);
      setFeedback(`"${skin.name}" 스킨을 장착했습니다.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '스킨 장착 중 오류가 발생했습니다.');
    } finally {
      setBusySkinId(null);
    }
  };

  const handlePurchase = async (skin: CharacterSkinDefinition) => {
    setError(null);
    setFeedback(null);
    setBusySkinId(skin.id);
    try {
      await purchaseCharacterSkin(student, character, skin);
      setPreviewSkinId(null);
      setFeedback(`"${skin.name}" 스킨을 구매하고 즉시 장착했습니다. (-${skin.price}P)`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '스킨 구매 중 오류가 발생했습니다.');
    } finally {
      setBusySkinId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500">
            {student.studentNumber} · {student.name} · 보유 스킨 {character.ownedSkins.length} / {CHARACTER_SKINS.length}
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 mt-1">
            내 캐릭터 · 스킨 상점
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            기본 캐릭터 외형은 영구 확정되어 변경할 수 없으며, 임무 포인트로 다양한 RPG 스킨을 구매해 장착할 수 있습니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm font-mono tabular-nums font-bold text-amber-900">
            <Coins className="w-4 h-4 text-amber-600" />
            <span>보유 {student.points} P</span>
          </div>
          <button
            type="button"
            onClick={onGoToMissions}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#1B365D] rounded-lg hover:bg-[#142847] transition-colors whitespace-nowrap cursor-pointer"
          >
            포인트 모으기 (임무)
          </button>
          <button
            type="button"
            onClick={onBackToDashboard}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap cursor-pointer"
          >
            대시보드
          </button>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl px-4 py-3 flex items-center gap-2 text-sm"
        >
          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 text-sm"
        >
          {error}
        </div>
      )}

      {/* Split Workspace: Sticky Character Stage on Left, Skin Shop on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Permanent Character Stage */}
        <aside className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 sm:p-7 lg:sticky lg:top-24">
          <div className="flex flex-col items-center text-center">
            <CharacterAvatar
              config={character}
              skinId={displaySkinId}
              size="lg"
            />

            {previewSkinId && previewSkinId !== character.equippedSkin && (
              <div className="mt-3 w-full flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-900">
                <span>미리보기: <strong>{displaySkin.name}</strong></span>
                <button
                  type="button"
                  onClick={() => setPreviewSkinId(null)}
                  className="font-semibold underline cursor-pointer"
                >
                  장착 스킨으로 복귀
                </button>
              </div>
            )}

            <div className="mt-5 w-full">
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {student.grade}등급 · 주력 {STAT_LABEL_MAP[topStat[0]]} ({topStat[1]})
                </span>
              </div>
              <h2 className="font-display text-xl font-bold text-slate-900 mt-1">
                {character.nickname}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                장착 스킨: <strong className="text-slate-900">{equippedSkin.name}</strong>
              </p>

              <p className="mt-3 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 leading-relaxed">
                {character.motto || '목포덕인고등학교 성장 여정 진행 중'}
              </p>
            </div>

            {/* Locked Base Appearance Summary */}
            <div className="mt-5 pt-5 border-t border-slate-100 w-full text-left">
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="font-semibold text-slate-700">고정된 기본 외형</span>
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Lock className="w-3 h-3" />
                  <span>변경 불가</span>
                </span>
              </div>
              <dl className="grid grid-cols-3 gap-y-2 gap-x-3 text-xs">
                <div>
                  <dt className="text-slate-400">피부 톤</dt>
                  <dd className="font-medium text-slate-800">{skinToneLabel}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">머리 색상</dt>
                  <dd className="font-medium text-slate-800">{hairColorLabel}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">눈 색상</dt>
                  <dd className="font-medium text-slate-800">{eyeLabel}</dd>
                </div>
              </dl>
            </div>
          </div>
        </aside>

        {/* Right: Skin Shop & Wardrobe */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                캐릭터 스킨 카탈로그
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                일일(1P) · 주간(3P) · 월간(10P) 임무를 완료해 포인트를 획득하세요
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('shop')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'shop'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>스킨 상점 ({CHARACTER_SKINS.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('wardrobe')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'wardrobe'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>보유 스킨 ({character.ownedSkins.length})</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {displayedSkins.map((skin) => {
              const owned = character.ownedSkins.includes(skin.id);
              const equipped = character.equippedSkin === skin.id;
              const isPreviewing = previewSkinId === skin.id;
              const canAfford = (student.points ?? 0) >= skin.price;
              const isBusy = busySkinId === skin.id;

              return (
                <article
                  key={skin.id}
                  className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <CharacterAvatar
                      config={character}
                      skinId={skin.id}
                      size="sm"
                      className={equipped ? 'ring-2 ring-[#1B365D]' : ''}
                    />

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{skin.tier} 등급</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums font-semibold text-amber-700">
                          {skin.price === 0 ? '기본 지급' : `${skin.price} P`}
                        </span>
                        {owned && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-700 font-medium">
                              {equipped ? '장착 중' : '보유 중'}
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="font-display text-base font-bold text-slate-900 mt-1">
                        {skin.name}
                      </h3>
                      <p className="text-xs font-medium text-[#1B365D] mt-0.5">
                        {skin.equipmentSummary}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {skin.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    {equipped ? (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg whitespace-nowrap">
                        <Check className="w-3.5 h-3.5" />
                        <span>장착 중</span>
                      </span>
                    ) : owned ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleEquip(skin)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#1B365D] rounded-lg hover:bg-[#142847] disabled:opacity-60 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        {isBusy ? '변경 중...' : '스킨 장착하기'}
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={isBusy || !canAfford}
                          onClick={() => handlePurchase(skin)}
                          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                            canAfford
                              ? 'bg-[#1B365D] text-white hover:bg-[#142847] cursor-pointer'
                              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          }`}
                        >
                          {isBusy
                            ? '구매 중...'
                            : canAfford
                              ? `${skin.price} P로 구매`
                              : `${skin.price - (student.points ?? 0)} P 부족`}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewSkinId(isPreviewing ? null : skin.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                            isPreviewing
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isPreviewing ? '미리보기 중' : '착용 미리보기'}</span>
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
