import type { GradientDef } from './tokens'

interface Props {
  defs: GradientDef[]
}

/**
 * Injeta definições de gradiente SVG dentro de um gráfico Recharts.
 * Coloque como filho direto do BarChart / AreaChart.
 *
 * Uso:
 *   <BarChart ...>
 *     <GradientDefs defs={[verticalGradient('g1', '#3b82f6')]} />
 *     <Bar fill="url(#g1)" ... />
 *   </BarChart>
 */
export function GradientDefs({ defs }: Props) {
  if (!defs.length) return null
  return (
    <defs>
      {defs.map((g) => (
        <linearGradient
          key={g.id}
          id={g.id}
          x1={g.x1 ?? '0'} y1={g.y1 ?? '0'}
          x2={g.x2 ?? '0'} y2={g.y2 ?? '1'}
        >
          {g.stops.map((s, i) => (
            <stop
              key={i}
              offset={s.offset}
              stopColor={s.color}
              stopOpacity={s.opacity}
            />
          ))}
        </linearGradient>
      ))}
    </defs>
  )
}
