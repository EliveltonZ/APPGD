import { PieChart, ResponsiveContainer, Pie, Tooltip, Cell } from "recharts";

export interface PieDataPoint {
  name: string;
  value: number;
  color: string;
}

interface GraphPieProps {
  data: PieDataPoint[];
}

export function GraphPie({ data }: GraphPieProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          label={({ value }) => value}
          labelLine={false}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) => [String(v ?? 0), "Qtd"]}
          contentStyle={{ fontSize: 11 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}