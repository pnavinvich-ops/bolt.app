import { useTranslation } from 'react-i18next';
import type { Vector } from '@/types/domain';

export interface SpiderSeries {
  label: string;
  color: string;
  values: Record<Vector, number>;
}

interface SpiderChartProps {
  series: SpiderSeries[];
  max: number;
  size?: number;
}

export default function SpiderChart({ series, max, size = 260 }: SpiderChartProps) {
  const { t } = useTranslation();
  const vectors: Vector[] = ['pronation', 'cup', 'rise', 'side', 'back', 'supination'];
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 38;
  const rings = [0.25, 0.5, 0.75, 1];

  const angleFor = (i: number) => (Math.PI * 2 * i) / vectors.length - Math.PI / 2;
  const pointFor = (i: number, ratio: number) => {
    const a = angleFor(i);
    return [cx + Math.cos(a) * radius * ratio, cy + Math.sin(a) * radius * ratio];
  };

  const axisPoints = vectors.map((_, i) => pointFor(i, 1));

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* rings */}
        {rings.map((r, ri) => {
          const pts = vectors.map((_, i) => pointFor(i, r).join(',')).join(' ');
          return (
            <polygon
              key={ri}
              points={pts}
              fill="none"
              stroke="#2A2A36"
              strokeWidth={1}
              strokeDasharray={ri === rings.length - 1 ? '0' : '3 3'}
            />
          );
        })}

        {/* axes */}
        {axisPoints.map(([x, y], i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#2A2A36"
            strokeWidth={1}
          />
        ))}

        {/* series polygons */}
        {series.map((s, si) => {
          const pts = vectors
            .map((v, i) => {
              const ratio = max > 0 ? Math.min(s.values[v] / max, 1) : 0;
              return pointFor(i, ratio).join(',');
            })
            .join(' ');
          return (
            <g key={si}>
              <polygon points={pts} fill={s.color} fillOpacity={0.12} stroke={s.color} strokeWidth={2} />
              {vectors.map((v, i) => {
                const ratio = max > 0 ? Math.min(s.values[v] / max, 1) : 0;
                const [x, y] = pointFor(i, ratio);
                return <circle key={i} cx={x} cy={y} r={3} fill={s.color} />;
              })}
            </g>
          );
        })}

        {/* labels */}
        {vectors.map((v, i) => {
          const a = angleFor(i);
          const lx = cx + Math.cos(a) * (radius + 20);
          const ly = cy + Math.sin(a) * (radius + 20);
          return (
            <text
              key={v}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-text-faint"
              style={{ fontSize: 10, fontWeight: 600 }}
            >
              {t(`enum.short.${v}`)}
            </text>
          );
        })}

        {/* legend */}
        {series.length > 1 && (
          <g>
            {series.map((s, i) => (
              <g key={i} transform={`translate(${size / 2 - 60}, ${size - 6 + i * 0})`}>
                <rect x={0} y={0} width={10} height={10} rx={2} fill={s.color} />
                <text x={14} y={9} className="fill-text-dim" style={{ fontSize: 10, fontWeight: 600 }}>
                  {s.label}
                </text>
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
