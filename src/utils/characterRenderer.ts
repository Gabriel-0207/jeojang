import {
  EYE_STYLE_OPTIONS,
  HAIR_COLOR_OPTIONS,
  SKIN_TONE_OPTIONS,
} from '../data/characterOptions';
import {
  CharacterBaseConfig,
  CharacterSkinId,
} from '../types/student';

const RENDER_CACHE = new Map<string, string>();
const MAX_CACHE_SIZE = 60;

interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  cx: number;
  cy: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function clampByte(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
}

export function isDefaultCharacterAppearance(config: CharacterBaseConfig): boolean {
  return (
    config.skinTone === 'warm' &&
    config.hairColor === 'black' &&
    config.eyeStyle === 'bright'
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

function buildExteriorAlphaMask(data: Uint8ClampedArray, w: number, h: number): Uint8Array {
  const visited = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;

  const isBg = (idx: number) => {
    const p = idx * 4;
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    return r >= 224 && g >= 224 && b >= 224 && maxC - minC <= 14;
  };

  const pushIfBg = (x: number, y: number) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const idx = y * w + x;
    if (visited[idx]) return;
    if (isBg(idx)) {
      visited[idx] = 1;
      queue[tail++] = idx;
    }
  };

  for (let x = 0; x < w; x++) {
    pushIfBg(x, 0);
    pushIfBg(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    pushIfBg(0, y);
    pushIfBg(w - 1, y);
  }

  while (head < tail) {
    const idx = queue[head++];
    const x = idx % w;
    const y = (idx - x) / w;
    if (x > 0) pushIfBg(x - 1, y);
    if (x + 1 < w) pushIfBg(x + 1, y);
    if (y > 0) pushIfBg(x, y - 1);
    if (y + 1 < h) pushIfBg(x, y + 1);
  }

  return visited;
}

function detectIrises(
  data: Uint8ClampedArray,
  w: number,
  h: number
): { left: BoundingBox; right: BoundingBox; headCx: number; eyeY: number; eyeSpan: number } {
  const yStart = Math.floor(h * 0.14);
  const yEnd = Math.floor(h * 0.36);
  const xStart = Math.floor(w * 0.28);
  const xEnd = Math.floor(w * 0.84);

  const pts: Array<[number, number]> = [];
  let sumX = 0;
  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      const p = (y * w + x) * 4;
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      if (r > 190 && g > 155 && b < 105 && r - b > 70 && g - b > 50) {
        pts.push([x, y]);
        sumX += x;
      }
    }
  }

  if (pts.length < 12) {
    const lx = w * 0.51;
    const rx = w * 0.69;
    const cy = h * 0.233;
    const r = w * 0.035;
    return {
      left: { minX: lx - r, minY: cy - r, maxX: lx + r, maxY: cy + r, cx: lx, cy },
      right: { minX: rx - r, minY: cy - r, maxX: rx + r, maxY: cy + r, cx: rx, cy },
      headCx: (lx + rx) / 2,
      eyeY: cy,
      eyeSpan: rx - lx,
    };
  }

  const splitX = sumX / pts.length;
  const makeBox = (subset: Array<[number, number]>): BoundingBox => {
    let minX = w;
    let minY = h;
    let maxX = 0;
    let maxY = 0;
    let sx = 0;
    let sy = 0;
    for (const [x, y] of subset) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      sx += x;
      sy += y;
    }
    return {
      minX,
      minY,
      maxX,
      maxY,
      cx: sx / subset.length,
      cy: sy / subset.length,
    };
  };

  const leftPts = pts.filter(([x]) => x < splitX);
  const rightPts = pts.filter(([x]) => x >= splitX);
  const left = leftPts.length > 0 ? makeBox(leftPts) : makeBox(pts);
  const right = rightPts.length > 0 ? makeBox(rightPts) : makeBox(pts);

  return {
    left,
    right,
    headCx: (left.cx + right.cx) / 2,
    eyeY: (left.cy + right.cy) / 2,
    eyeSpan: Math.max(w * 0.12, right.cx - left.cx),
  };
}

function detectChinY(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  headCx: number,
  eyeY: number,
  eyeSpan: number
): number {
  const x = Math.round(headCx);
  const startY = Math.round(eyeY + eyeSpan * 0.45);
  const endY = Math.min(h - 1, Math.round(eyeY + eyeSpan * 1.15));

  for (let y = startY; y <= endY; y++) {
    const p = (y * w + x) * 4;
    if (data[p] < 65 && data[p + 1] < 65 && data[p + 2] < 65) {
      return y;
    }
  }
  return Math.round(eyeY + eyeSpan * 0.85);
}

export async function renderCustomizedCharacterDataUrl(
  baseImageSrc: string,
  skinId: CharacterSkinId,
  config: CharacterBaseConfig
): Promise<string> {
  if (isDefaultCharacterAppearance(config)) {
    return baseImageSrc;
  }

  const cacheKey = `${skinId}|${config.skinTone}|${config.hairColor}|${config.eyeStyle}`;
  const cached = RENDER_CACHE.get(cacheKey);
  if (cached) {
    return cached;
  }

  const img = await loadImage(baseImageSrc);
  const targetW = Math.min(380, img.naturalWidth || 380);
  const scale = targetW / (img.naturalWidth || 380);
  const targetH = Math.max(1, Math.round((img.naturalHeight || 720) * scale));

  const workCanvas = document.createElement('canvas');
  workCanvas.width = targetW;
  workCanvas.height = targetH;
  const workCtx = workCanvas.getContext('2d', { willReadFrequently: true });
  if (!workCtx) return baseImageSrc;

  workCtx.drawImage(img, 0, 0, targetW, targetH);
  const imgData = workCtx.getImageData(0, 0, targetW, targetH);
  const data = imgData.data;

  const exteriorMask = buildExteriorAlphaMask(data, targetW, targetH);
  const { left: leftIris, right: rightIris, headCx, eyeY, eyeSpan } = detectIrises(
    data,
    targetW,
    targetH
  );
  const chinY = detectChinY(data, targetW, targetH, headCx, eyeY, eyeSpan);

  const skinOpt =
    SKIN_TONE_OPTIONS.find((s) => s.id === config.skinTone) ?? SKIN_TONE_OPTIONS[1];
  const hairOpt =
    HAIR_COLOR_OPTIONS.find((h) => h.id === config.hairColor) ?? HAIR_COLOR_OPTIONS[0];
  const eyeOpt =
    EYE_STYLE_OPTIONS.find((e) => e.id === config.eyeStyle) ?? EYE_STYLE_OPTIONS[0];

  const targetSkinRgb = hexToRgb(skinOpt.fill);
  const targetHairRgb = hexToRgb(hairOpt.fill);
  const targetHairHiRgb = hexToRgb(hairOpt.highlight);
  const targetEyeRgb = hexToRgb(eyeOpt.iris);

  const recolorSkin = config.skinTone !== 'warm';
  const recolorHair = config.hairColor !== 'black';
  const recolorEyes = config.eyeStyle !== 'bright';

  const hairLimitY = chinY - Math.round(eyeSpan * 0.04);
  const napeBackX = headCx - eyeSpan * 0.42;
  const browTopY = eyeY - eyeSpan * 0.34;
  const eyeBandBottomY = eyeY + eyeSpan * 0.16;

  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      const idx = y * targetW + x;
      const p = idx * 4;

      if (exteriorMask[idx]) {
        data[p + 3] = 0;
        continue;
      }

      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];

      const inLeftIris =
        x >= leftIris.minX - 2 &&
        x <= leftIris.maxX + 2 &&
        y >= leftIris.minY - 2 &&
        y <= leftIris.maxY + 2;
      const inRightIris =
        x >= rightIris.minX - 2 &&
        x <= rightIris.maxX + 2 &&
        y >= rightIris.minY - 2 &&
        y <= rightIris.maxY + 2;

      // 1. Eye Iris Color Only (Expression untouched)
      if (recolorEyes && (inLeftIris || inRightIris)) {
        if (r > 155 && g > 125 && b < 120 && r - b > 45) {
          const lum = (0.3 * r + 0.59 * g + 0.11 * b) / 215;
          data[p] = clampByte(targetEyeRgb[0] * lum);
          data[p + 1] = clampByte(targetEyeRgb[1] * lum);
          data[p + 2] = clampByte(targetEyeRgb[2] * lum);
          continue;
        }
      }

      // 2. Skin Tone (Face, Ear, Neck, Hands)
      if (
        recolorSkin &&
        !inLeftIris &&
        !inRightIris &&
        y < targetH * 0.65 &&
        r >= 165 &&
        g >= 110 &&
        b >= 80 &&
        r > g &&
        g > b &&
        r - g >= 12 &&
        r - g <= 55 &&
        g - b >= 4 &&
        g - b <= 46 &&
        r - b >= 20 &&
        r - b <= 95
      ) {
        const lumRatio = Math.max(0.58, Math.min(1.12, (0.3 * r + 0.59 * g + 0.11 * b) / 216));
        data[p] = clampByte(targetSkinRgb[0] * lumRatio);
        data[p + 1] = clampByte(targetSkinRgb[1] * lumRatio);
        data[p + 2] = clampByte(targetSkinRgb[2] * lumRatio);
        continue;
      }

      // 3. Hair Color Only (Hairstyle & individual strand texture untouched)
      if (recolorHair && y <= hairLimitY) {
        const isBehindEarOrCrown = y < browTopY || x < napeBackX;
        const isInUpperBangTips =
          y >= browTopY &&
          y <= eyeBandBottomY &&
          !inLeftIris &&
          !inRightIris;

        if (isBehindEarOrCrown || isInUpperBangTips) {
          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          const lum = 0.3 * r + 0.59 * g + 0.11 * b;
          const minLum = isInUpperBangTips ? 26 : 20;

          if (maxC - minC <= 24 && lum >= minLum && lum <= 116) {
            const t = Math.max(0, Math.min(1, (lum - 20) / 56));
            // Smooth shadow -> midtone -> highlight ramp supporting dark and bright hair tones
            const shadowFactor = 0.62;
            const hiMix = Math.max(0, (t - 0.38) / 0.62);
            const shadeMix = Math.min(1, t / 0.42);

            const baseR = targetHairRgb[0] * (shadowFactor + (1 - shadowFactor) * shadeMix);
            const baseG = targetHairRgb[1] * (shadowFactor + (1 - shadowFactor) * shadeMix);
            const baseB = targetHairRgb[2] * (shadowFactor + (1 - shadowFactor) * shadeMix);

            data[p] = clampByte(baseR * (1 - hiMix * 0.72) + targetHairHiRgb[0] * (hiMix * 0.72));
            data[p + 1] = clampByte(baseG * (1 - hiMix * 0.72) + targetHairHiRgb[1] * (hiMix * 0.72));
            data[p + 2] = clampByte(baseB * (1 - hiMix * 0.72) + targetHairHiRgb[2] * (hiMix * 0.72));
          }
        }
      }
    }
  }

  workCtx.putImageData(imgData, 0, 0);

  const resultUrl = workCanvas.toDataURL('image/png');
  if (RENDER_CACHE.size >= MAX_CACHE_SIZE) {
    const firstKey = RENDER_CACHE.keys().next().value;
    if (firstKey) RENDER_CACHE.delete(firstKey);
  }
  RENDER_CACHE.set(cacheKey, resultUrl);
  return resultUrl;
}
