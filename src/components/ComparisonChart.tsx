import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { SeriesValue } from '../api/seriesTypes';

export interface ComparisonChartRow {
  time: string;
  cells: Record<string, SeriesValue | undefined>;
}

export interface ComparisonChartSeriesDef {
  id: string;
  label: string;
}

export interface ComparisonChartProps {
  rows: ComparisonChartRow[];
  series: ComparisonChartSeriesDef[];
  unit: string;
}

/** Distinct, roughly colorblind-safe categorical palette — enough entries for every implemented provider at once. */
const CHART_COLORS = ['#2a78d6', '#e07b39', '#3fa34d', '#c0392b', '#8e44ad', '#16a085', '#c9a227', '#7f8c8d', '#c2185b'];

function formatAxisTime(iso: string, index: number): string {
  if (!iso) return `#${index + 1}`;
  const match = /T(\d{2}:\d{2})/.exec(iso);
  return match?.[1] ?? iso;
}

/**
 * Multi-provider line chart backing the Compare page — same `rows` the
 * table above it renders, so the two views can never disagree. One line
 * per provider that actually returned data for this variable; providers
 * that were skipped/unavailable/errored simply aren't in `series`.
 */
export function ComparisonChart({ rows, series, unit }: ComparisonChartProps): JSX.Element {
  const data = rows.map((row, index) => {
    const point: Record<string, string | number> = { time: formatAxisTime(row.time, index) };
    for (const { id } of series) {
      const value = row.cells[id];
      if (typeof value === 'number') point[id] = value;
    }
    return point;
  });

  return (
    <div className="h-72 w-full px-2 py-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line, #e1e0d9)" />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} interval="preserveStartEnd" minTickGap={24} />
          <YAxis tick={{ fontSize: 11 }} width={48} label={{ value: unit, angle: -90, position: 'insideLeft', fontSize: 11 }} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(value) => `${String(value)} ${unit}`} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {series.map(({ id, label }, index) => (
            <Line
              key={id}
              type="monotone"
              dataKey={id}
              name={label}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={2}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
