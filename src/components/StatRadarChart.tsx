import { useState } from 'react';
import { MAX_STAT_VALUE, STAT_DEFINITIONS } from '../data/missions';
import { StatKey, StudentStats } from '../types/student';

interface StatRadarChartProps {
  stats: StudentStats;
}

export function StatRadarChart({ stats }: StatRadarChartProps) {
  const [activeKey, setActiveKey] = useState<StatKey | null>(null);

  const scaleMax = MAX_STAT_VALUE;

  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 108;
  const ringLevels = [0.25, 0.5, 0.75, 1];

  const getPoint = (index: number, ratio: number) => {
    const angle = (-90 + index * 60) * (Math.PI / 180);
    return {
      x: cx + radius * ratio * Math.cos(angle),
      y: cy + radius * ratio * Math.sin(angle),
    };
  };

  const dataPoints = STAT_DEFINITIONS.map((def, idx) => {
    const ratio = Math.min(1, Math.max(0.08, stats[def.key] / scaleMax));
    return getPoint(idx, ratio);
  });

  const polygonPoints = dataPoints.map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[340px] aspect-square relative">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full overflow-visible"
          role="img"
          aria-label="6대 학교 생활 능력치 육각형 레이더 차트"
        >
          {/* Concentric Hexagons */}
          {ringLevels.map((level) => {
            const pts = STAT_DEFINITIONS.map((_, idx) => {
              const p = getPoint(idx, level);
              return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            }).join(' ');
            return (
              <polygon
                key={level}
                points={pts}
                fill={level === 1 ? '#F8FAFC' : 'none'}
                stroke="#CBD5E1"
                strokeWidth={level === 1 ? '1.25' : '0.85'}
                strokeDasharray={level < 1 ? '3 3' : undefined}
              />
            );
          })}

          {/* Axis Lines */}
          {STAT_DEFINITIONS.map((def, idx) => {
            const outer = getPoint(idx, 1);
            return (
              <line
                key={def.key}
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
            );
          })}

          {/* Stat Polygon */}
          <polygon
            points={polygonPoints}
            fill="rgba(27, 54, 93, 0.16)"
            stroke="#1B365D"
            strokeWidth="2.25"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Interactive Vertices */}
          {STAT_DEFINITIONS.map((def, idx) => {
            const pt = dataPoints[idx];
            const isHovered = activeKey === def.key;
            return (
              <g
                key={def.key}
                onMouseEnter={() => setActiveKey(def.key)}
                onMouseLeave={() => setActiveKey(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4.2}
                  fill={isHovered ? '#B45309' : '#1B365D'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />
              </g>
            );
          })}

          {/* Vertex Labels */}
          {STAT_DEFINITIONS.map((def, idx) => {
            const labelPos = getPoint(idx, 1.24);
            const anchor =
              idx === 0 || idx === 3 ? 'middle' : idx === 1 || idx === 2 ? 'start' : 'end';
            const dy = idx === 0 ? -4 : idx === 3 ? 10 : 4;
            const isActive = activeKey === def.key;
            return (
              <g
                key={`label-${def.key}`}
                onMouseEnter={() => setActiveKey(def.key)}
                onMouseLeave={() => setActiveKey(null)}
                className="cursor-pointer"
              >
                <text
                  x={labelPos.x}
                  y={labelPos.y + dy}
                  textAnchor={anchor}
                  className={`text-[12px] font-medium transition-colors ${
                    isActive ? 'fill-[#B45309] font-semibold' : 'fill-slate-700'
                  }`}
                >
                  {def.label}
                </text>
                <text
                  x={labelPos.x}
                  y={labelPos.y + dy + 15}
                  textAnchor={anchor}
                  className="text-[11px] font-mono tabular-nums fill-slate-500"
                >
                  {stats[def.key]}점
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="w-full pt-3 mt-1 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>차트 기준 최대치</span>
        <span className="font-mono tabular-nums text-slate-700 font-medium">{scaleMax}점</span>
      </div>
    </div>
  );
}
