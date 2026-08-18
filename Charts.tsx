import { useMemo } from 'react';

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  unit?: string;
}

export function BarChart({ data, height = 200, unit = '' }: BarChartProps) {
  const max = useMemo(() => {
    const m = Math.max(...data.map((d) => d.value), 0);
    return m === 0 ? 1 : m;
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-slate-500 text-sm" style={{ height }}>
        Sem dados para exibir
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-end gap-3" style={{ height }}>
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 40);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 min-w-0">
              <span className="text-xs font-medium text-slate-300">
                {d.value.toLocaleString('pt-BR')}{unit}
              </span>
              <div
                className="w-full rounded-t-md transition-all duration-500 hover:opacity-80"
                style={{
                  height: Math.max(h, 2),
                  backgroundColor: d.color ?? '#f59e0b',
                  minHeight: 2,
                }}
              />
              <span className="text-xs text-slate-400 text-center truncate w-full" title={d.label}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  unit?: string;
}

export function LineChart({ data, height = 200, unit = '' }: LineChartProps) {
  const width = 600;
  const padding = 40;

  const { points, max, min } = useMemo(() => {
    if (data.length === 0) return { points: [], max: 0, min: 0 };
    const vals = data.map((d) => d.value);
    const mx = Math.max(...vals, 0);
    const mn = Math.min(...vals, 0);
    const range = mx - mn || 1;
    const pts = data.map((d, i) => {
      const x = padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2);
      const y = height - padding - ((d.value - mn) / range) * (height - padding * 2);
      return { x, y, ...d };
    });
    return { points: pts, max: mx, min: mn };
  }, [data, height]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-slate-500 text-sm" style={{ height }}>
        Sem dados para exibir
      </div>
    );
  }

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: 400 }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = padding + t * (height - padding * 2);
          const val = max - t * (max - min);
          return (
            <g key={t}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1e293b" strokeWidth="1" />
              <text x={padding - 8} y={y + 4} fill="#64748b" fontSize="10" textAnchor="end">
                {val.toFixed(0)}{unit}
              </text>
            </g>
          );
        })}

        <path d={areaD} fill="url(#lineGrad)" />
        <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#f59e0b" stroke="#0f172a" strokeWidth="2" />
            <text x={p.x} y={height - padding + 18} fill="#64748b" fontSize="10" textAnchor="middle">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export function DonutChart({ data, size = 180 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = size / 2 - 20;
  const cx = size / 2;
  const cy = size / 2;
  const stroke = 24;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center text-slate-500 text-sm" style={{ height: size }}>
        Sem dados
      </div>
    );
  }

  let offset = 0;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg width={size} height={size} className="flex-shrink-0">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#1e293b" strokeWidth={stroke} />
        {data.map((d, i) => {
          const fraction = d.value / total;
          const dash = fraction * circumference;
          const seg = (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: 'stroke-dashoffset 0.5s' }}
            />
          );
          offset += dash;
          return seg;
        })}
        <text x={cx} y={cy - 5} textAnchor="middle" fill="#fff" fontSize="22" fontWeight="bold">
          {total}
        </text>
        <text x={cx} y={cy + 15} textAnchor="middle" fill="#64748b" fontSize="11">
          Total
        </text>
      </svg>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
            <span className="text-slate-300">{d.label}</span>
            <span className="text-slate-500 ml-auto">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
