interface MetricProps {
  label: string;
  value: string | number;
}

export function Metric({ label, value }: MetricProps) {
  return (
    <div className="proj-kpi">
      <span className="proj-kpi__label">{label}</span>
      <span className="proj-kpi__value">{value}</span>
    </div>
  );
}