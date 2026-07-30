import {
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  Bar,
} from "recharts";

export interface ChartDataPoint {
  name: string;
  value: number;
}

interface GraphBarProps {
  data: ChartDataPoint[];
  color: string;
}

const TICK = { fontSize: 9 } as const;

export function GraphBar({ data, color }: GraphBarProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ ...TICK, angle: -90, textAnchor: "end", dx: -3 }}
          interval={0}
          height={90}
        />
        <YAxis
          tick={TICK}
          label={{
            angle: -90,
            value: "Total",
            position: "insideLeft",
            style: { fontSize: 9 },
          }}
        />
        <Tooltip
          formatter={(v) => [String(v ?? 0), "Qtd"]}
          contentStyle={{ fontSize: 11 }}
        />
        <Bar dataKey="value" fill={color} radius={[5, 5, 0, 0]} maxBarSize={18}>
          <LabelList
            dataKey="value"
            position="top"
            style={{ fontSize: 8, fill: "var(--text-h)" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}