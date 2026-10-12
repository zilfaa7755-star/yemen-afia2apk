import { useState } from 'react';
import { timelineEras } from '../data/clinicalData';
import { Activity, TrendingUp, Calendar } from 'lucide-react';

interface TimelineProps {
  onEraClick: (era: typeof timelineEras[0]) => void;
}

export function Timeline({ onEraClick }: TimelineProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const maxVisits = Math.max(...timelineEras.map((e) => e.visits));
  const chartWidth = 720;
  const chartHeight = 160;
  const padding = 40;
  const barWidth = (chartWidth - padding * 2) / timelineEras.length;
  const maxHba1c = 10;

  // Spline path for HbA1c
  const splinePoints = timelineEras.map((era, i) => ({
    x: padding + barWidth * i + barWidth / 2,
    y: chartHeight - padding / 2 - (era.hba1c / maxHba1c) * (chartHeight - padding),
  hba1c: era.hba1c,
  year: era.year,
  visits: era.visits,
  isSpike: era.isSpike,
  label: era.label,
    summary: era.summary,
  }));

  const splinePath = generateSplinePath(splinePoints.map((p) => ({ x: p.x, y: p.y })));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
            <Activity className="w-4.5 h-4.5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">الخط الزمني الطولي للزيارات (2020 - 2026)</h2>
            <p className="text-xs text-slate-400">انقر على أي عمود لعرض الملخص السريري للفترة</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary-500" />
            <span className="text-slate-500 font-medium">الزيارات</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-amber-500" style={{ borderTop: '2px dashed #F59E0B' }} />
            <span className="text-slate-500 font-medium">HbA1c (%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-danger-500" />
            <span className="text-slate-500 font-medium">نكس حاد</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}
          className="w-full h-auto"
          style={{ maxHeight: '200px' }}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1={padding}
              x2={chartWidth - padding}
              y1={padding / 2 + ratio * (chartHeight - padding)}
              y2={padding / 2 + ratio * (chartHeight - padding)}
              stroke="#E2E8F0"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          ))}

          {/* Y-axis labels for HbA1c */}
          {[0, 5, 10].map((val) => (
            <text
              key={val}
              x={padding - 8}
              y={chartHeight - padding / 2 - (val / maxHba1c) * (chartHeight - padding) + 4}
              textAnchor="end"
              className="text-[9px] fill-amber-500 font-semibold"
            >
              {val}%
            </text>
          ))}

          {/* Bars */}
          {timelineEras.map((era, i) => {
            const barH = (era.visits / maxVisits) * (chartHeight - padding);
            const x = padding + barWidth * i + barWidth * 0.15;
            const w = barWidth * 0.7;
            const y = chartHeight - padding / 2 - barH;
            const isHovered = hovered === i;
            return (
              <g
                key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onEraClick(era)}
                className="cursor-pointer"
              >
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={barH}
                  rx="4"
                  fill={era.isSpike ? '#EF4444' : '#0284C7'}
                  opacity={isHovered ? 1 : 0.85}
                  className="transition-all"
                  style={{
                    filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' : 'none',
                    transform: isHovered ? 'translateY(-2px)' : 'none',
                  }}
                />
                {era.isSpike && (
                  <rect
                    x={x}
                    y={y - 6}
                    width={w}
                    height="3"
                    rx="1.5"
                    fill="#DC2626"
                    className="animate-pulse"
                  />
                )}
                {/* Visit count label */}
                <text
                  x={x + w / 2}
                  y={y - 12}
                  textAnchor="middle"
                  className={`text-[11px] font-bold ${era.isSpike ? 'fill-danger-600' : 'fill-primary-700'}`}
                >
                  {era.visits}
                </text>
                {/* Year label */}
                <text
                  x={x + w / 2}
                  y={chartHeight - padding / 2 + 16}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-500 font-semibold"
                >
                  {era.year}
                </text>
                {/* Hover tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={x + w / 2 - 50}
                      y={y - 50}
                      width="100"
                      height="28"
                      rx="6"
                      fill="#0F172A"
                      opacity="0.95"
                    />
                    <text
                      x={x + w / 2}
                      y={y - 38}
                      textAnchor="middle"
                      className="text-[9px] fill-white font-semibold"
                    >
                      {era.label}
                    </text>
                    <text
                      x={x + w / 2}
                      y={y - 28}
                      textAnchor="middle"
                      className="text-[8px] fill-amber-400 font-semibold"
                    >
                      HbA1c: {era.hba1c}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* HbA1c spline curve */}
          <path
            d={splinePath}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeDasharray="6,3"
            opacity="0.9"
          />
          {splinePoints.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#F59E0B"
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer"
              />
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                className="text-[9px] fill-amber-600 font-bold"
              >
                {p.hba1c}%
              </text>
            </g>
          ))}

          {/* Baseline */}
          <line
            x1={padding}
            x2={chartWidth - padding}
            y1={chartHeight - padding / 2}
            y2={chartHeight - padding / 2}
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mt-2 px-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <p className="text-xs text-slate-400">
            إجمالي الزيارات: 35 عبر 5 منشآت | آخر تحديث: 2026/09/11
          </p>
        </div>
        <div className="flex items-center gap-2 sm:mr-auto">
          <TrendingUp className="w-3.5 h-3.5 text-danger-500 shrink-0" />
          <p className="text-xs text-danger-600 font-semibold">
            ذروة 2024: نكس كلوي حاد
          </p>
        </div>
      </div>
    </div>
  );
}

function generateSplinePath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  const path = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
  }
  return path.join(' ');
}
