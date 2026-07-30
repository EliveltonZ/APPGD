import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import type { ChartDataPoint } from "../Bar";

interface GraphAreaProps {
  data: ChartDataPoint[];
  avg: number;
}

const TICK = { fontSize: 9 } as const;

export function GraphArea({ data, avg }: GraphAreaProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="name" tick={TICK} />
        <YAxis
          tick={TICK}
          label={{
            value: "Total",
            angle: -90,
            position: "insideLeft",
            style: { fontSize: 9 },
          }}
        />
        <Tooltip
          formatter={(v) => [String(v ?? 0), "Qtd"]}
          contentStyle={{ fontSize: 11 }}
        />
        <ReferenceLine y={avg} stroke="#eab308" strokeDasharray="2 2" />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#dc2626"
          fill="rgba(220,38,38,0.25)"
          strokeWidth={2}
          dot={{ r: 3, fill: "#dc2626" }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}