import { useEffect, useState } from 'react';
import skinTrackRunner from '../assets/images/skin_track_runner_1795495087333.jpg';
import skinArcaneScholar from '../assets/images/skin_arcane_scholar_1795495088298.jpg';
import skinCrimsonKnight from '../assets/images/skin_crimson_knight_1795495088617.jpg';
import skinEmeraldArcher from '../assets/images/skin_emerald_archer_1795495089591.jpg';
import skinValkyrieGold from '../assets/images/skin_valkyrie_gold_1795495090628.jpg';
import skinRoyalPaladin from '../assets/images/skin_royal_paladin_1795495091970.jpg';
import skinCelestialLord from '../assets/images/skin_celestial_lord_1795495096218.jpg';
import { SKIN_MAP } from '../data/characterOptions';
import {
  CharacterBaseConfig,
  CharacterSkinId,
} from '../types/student';
import {
  isDefaultCharacterAppearance,
  renderCustomizedCharacterDataUrl,
} from '../utils/characterRenderer';

interface CharacterAvatarProps {
  config: CharacterBaseConfig;
  skinId?: CharacterSkinId;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-14 h-[86px] rounded-lg',
  sm: 'w-20 h-[124px] rounded-xl',
  md: 'w-28 h-[172px] rounded-xl',
  lg: 'w-full max-w-[236px] aspect-[11/17] rounded-2xl',
};

const SKIN_IMAGE_MAP: Record<CharacterSkinId, string> = {
  novice_uniform: '/assets/aistudio/________________7ccf1186.png',
  track_runner: skinTrackRunner,
  arcane_scholar: skinArcaneScholar,
  crimson_knight: skinCrimsonKnight,
  emerald_archer: skinEmeraldArcher,
  valkyrie_gold: skinValkyrieGold,
  royal_paladin: skinRoyalPaladin,
  celestial_lord: skinCelestialLord,
};

function getBackdropStyle(skinId: CharacterSkinId) {
  const skinDef = SKIN_MAP[skinId] ?? SKIN_MAP.novice_uniform;

  if (skinId === 'novice_uniform') {
    return {
      background: '#F3F3F3',
      borderColor: undefined,
      shadowColor: 'rgba(15, 23, 42, 0.22)',
      hasStarlight: false,
      auraColor: undefined,
    };
  }

  return {
    background: `radial-gradient(ellipse at 50% 52%, #F4F4F4 58%, ${skinDef.bgBottom} 100%)`,
    borderColor: skinDef.auraColor,
    shadowColor: skinDef.auraColor ? `${skinDef.auraColor}55` : 'rgba(15, 23, 42, 0.24)',
    hasStarlight:
      skinId === 'celestial_lord' ||
      skinId === 'valkyrie_gold' ||
      skinId === 'royal_paladin' ||
      skinId === 'arcane_scholar',
    auraColor: skinDef.auraColor,
  };
}

export function CharacterAvatar({
  config,
  skinId = 'novice_uniform',
  size = 'md',
  className = '',
}: CharacterAvatarProps) {
  const skinDef = SKIN_MAP[skinId] ?? SKIN_MAP.novice_uniform;
  const baseImageSrc = SKIN_IMAGE_MAP[skinId] ?? SKIN_IMAGE_MAP.novice_uniform;
  const isDefault = isDefaultCharacterAppearance(config);
  const [renderedSrc, setRenderedSrc] = useState<string>(baseImageSrc);

  useEffect(() => {
    if (isDefault) {
      setRenderedSrc(baseImageSrc);
      return;
    }

    let cancelled = false;
    renderCustomizedCharacterDataUrl(baseImageSrc, skinId, config)
      .then((nextUrl) => {
        if (!cancelled) {
          setRenderedSrc(nextUrl);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRenderedSrc(baseImageSrc);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    baseImageSrc,
    isDefault,
    skinId,
    config.skinTone,
    config.hairColor,
    config.eyeStyle,
  ]);

  const backdrop = getBackdropStyle(skinId);
  const isCompact = size === 'xs' || size === 'sm';

  return (
    <div
      className={`relative overflow-hidden border border-slate-200 bg-[#F3F3F3] shrink-0 select-none ${SIZE_MAP[size]} ${className}`}
      style={{
        background: backdrop.background,
        borderColor: backdrop.borderColor,
      }}
    >
      {/* Subtle Starlight / Tier Sparkle Accents for Special Skins */}
      {backdrop.hasStarlight && !isCompact && backdrop.auraColor && (
        <div className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
          <span
            className="absolute top-[11%] left-[12%] w-1.5 h-1.5 rounded-full opacity-75"
            style={{ backgroundColor: backdrop.auraColor }}
          />
          <span
            className="absolute top-[16%] right-[13%] w-1.5 h-1.5 rounded-full opacity-70"
            style={{ backgroundColor: backdrop.auraColor }}
          />
          <span
            className="absolute bottom-[28%] left-[10%] w-1 h-1 rounded-full opacity-60"
            style={{ backgroundColor: backdrop.auraColor }}
          />
          <span
            className="absolute bottom-[34%] right-[11%] w-1 h-1 rounded-full opacity-60"
            style={{ backgroundColor: backdrop.auraColor }}
          />
        </div>
      )}

      {/* Ground Shadow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[3%] flex justify-center z-20"
      >
        <div
          className="w-[46%] h-2 rounded-full blur-[2px] animate-char-shadow"
          style={{ backgroundColor: backdrop.shadowColor }}
        />
      </div>

      {/* Base or Live-Customized Character Image with Subtle Idle Motion */}
      <img
        src={renderedSrc}
        alt={`${config.nickname} (${skinDef.name})`}
        referrerPolicy="no-referrer"
        draggable={false}
        className="relative z-10 w-full h-full object-contain object-bottom px-1.5 pt-1.5 pb-[3.5%] animate-char-breathe"
      />
    </div>
  );
}
