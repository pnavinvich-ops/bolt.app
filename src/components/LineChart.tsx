interface LineChartProps {
  points: { ts: number; value: number }[];
  height?: number;
  color?: string;
}

export default function LineChart({ points, height = 140, color = '#FF5A1F' }: LineChartProps) {
  const width = 320;
  const padX = 8;
  const padY = 12;

  if (points.length === 0) return null;

  const xs = points.map((p) => p.ts);
  const ys = points.map((p) => p.value);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = Math.max(maxX - minX, 1);
  const rangeY = Math.max(maxY - minY, 0.001);

  const toXY = (p: { ts: number; value: number }): [number, number] => [
    padX + ((p.ts - minX) / rangeX) * (width - padX * 2),
    height - padY - ((p.value - minY) / rangeY) * (height - padY * 2),
  ];

  const coords = points.map(toXY);
  const path = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${path} L${coords[coords.length - 1][0].toFixed(1)},${height - padY} L${coords[0][0].toFixed(1)},${height - padY} Z`;
  const last = coords[coords.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img">
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={padX}
          x2={width - padX}
          y1={padY + f * (height - padY * 2)}
          y2={padY + f * (height - padY * 2)}
          stroke="#2A2A36"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      ))}
      <path d={area} fill={color} fillOpacity={0.08} />
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {coords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.5} fill={color} />
      ))}
      <circle cx={last[0]} cy={last[1]} r={4} fill={color} stroke="#12131A" strokeWidth={2} />
    </svg>
  );
}
