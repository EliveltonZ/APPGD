import "./Charts.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TOOLTIP_STYLE, SERIES_COLORS } from "./tokens";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface DonutSegment {
  name: string;
  value: number;
  color?: string;
}

export interface ChartDonutProps {
  data: DonutSegment[];
  /** Cores dos segmentos — sobrescreve `segment.color` e SERIES_COLORS */
  colors?: string[];
  height?: number;
  title?: string;
  innerRadius?: number; // 0 = pizza, >0 = donut
  outerRadius?: number;
  /** Border radius de cada fatia em px (padrão: 4) */
  cornerRadius?: number;
  showLegend?: boolean;
  /** Formata o rótulo externo de cada fatia. null = sem rótulo */
  labelFormat?: ((entry: DonutSegment) => string) | null;
  tooltipFormatter?: (value: number, entry: DonutSegment) => string;
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function ChartDonut({
  data,
  colors,
  height = 240,
  title,
  innerRadius = 55,
  outerRadius = 90,
  cornerRadius = 8,
  showLegend = false,
  labelFormat,
  tooltipFormatter,
}: ChartDonutProps) {
  const resolveColor = (entry: DonutSegment, i: number) =>
    entry.color ?? colors?.[i] ?? SERIES_COLORS[i % SERIES_COLORS.length];

  const renderLabel =
    labelFormat === null
      ? undefined
      : labelFormat
        ? (entry: unknown) => labelFormat(entry as DonutSegment)
        : ({ name, value }: { name: string; value: number }) =>
            `${name} (${value})`;

  return (
    <div className="chart-wrap">
      {title && <p className="proj-chart__title">{title}</p>}

      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            cornerRadius={cornerRadius}
            paddingAngle={2}
            stroke="none"
            label={renderLabel as any}
            labelLine={false}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={resolveColor(entry, i)} />
            ))}
          </Pie>

          <Tooltip
            formatter={(v, name) => [
              tooltipFormatter
                ? tooltipFormatter(
                    Number(v),
                    data.find((d) => d.name === name)!,
                  )
                : String(v ?? 0),
              String(name),
            ]}
            contentStyle={TOOLTIP_STYLE}
          />

          {showLegend && <Legend wrapperStyle={{ fontSize: 10 }} />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
