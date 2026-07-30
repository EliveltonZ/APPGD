import './Charts.css'
import { useId } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { GradientDefs } from './GradientDefs'
import {
  AXIS_TICK,
  TOOLTIP_STYLE,
  LINE_WIDTH,
  DOT_RADIUS,
  AREA_OPACITY,
  SERIES_COLORS,
  verticalGradient,
} from './tokens'
import type { GradientDef } from './tokens'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface AreaSeriesConfig {
  dataKey:      string
  label?:       string
  color?:       string
  /** Opacidade do preenchimento (default: AREA_OPACITY ≈ 12%) */
  fillOpacity?: number
  /** Se fornecido, o preenchimento usa gradiente em vez de fillOpacity fixo */
  gradient?:    { fromOpacity?: number; toOpacity?: number }
  strokeWidth?: number
  dotRadius?:   number
  type?:        'monotone' | 'linear' | 'step'
}

export interface ChartAreaProps {
  data:     Record<string, unknown>[]
  series:   AreaSeriesConfig[]
  xKey?:    string
  height?:  number
  title?:   string
  axisLabel?: string
  showLegend?: boolean
  gradients?: GradientDef[]
  referenceLines?: { y: number; color?: string; dash?: string; label?: string }[]
  margin?: { top?: number; right?: number; bottom?: number; left?: number }
  xUnit?:  string
  yUnit?:  string
  xTickProps?: object
  yTickProps?: object
  /** Valor do eixo X selecionado — desenha linha vertical de destaque */
  selectedValue?: string
  /** Chamado ao clicar no gráfico; recebe o valor do eixo X */
  onAreaClick?: (value: string) => void
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function ChartArea({
  data,
  series,
  xKey      = 'name',
  height    = 240,
  title,
  axisLabel,
  showLegend,
  gradients: extraGradients = [],
  referenceLines = [],
  margin    = { top: 16, right: 24, left: 8, bottom: 4 },
  xUnit,
  yUnit,
  xTickProps,
  yTickProps,
  selectedValue,
  onAreaClick,
}: ChartAreaProps) {
  const uid = useId().replace(/:/g, '')
  const autoDefs: GradientDef[] = []

  const resolvedSeries = series.map((s, idx) => {
    const color = s.color ?? SERIES_COLORS[idx % SERIES_COLORS.length]

    if (s.gradient !== undefined) {
      const gradId = `carea-${uid}-${s.dataKey}-${idx}`
      const { fromOpacity = 0.55, toOpacity = 0.02 } = s.gradient
      autoDefs.push(verticalGradient(gradId, color, fromOpacity, toOpacity))
      return { ...s, color, _fillId: gradId, _fillOpacity: 1 }
    }

    return { ...s, color, _fillId: null, _fillOpacity: s.fillOpacity ?? AREA_OPACITY }
  })

  const allDefs = [...autoDefs, ...extraGradients]
  const hasLegend = showLegend ?? series.length > 1

  const xTick = { ...AXIS_TICK, ...xTickProps }
  const yTick = { ...AXIS_TICK, ...yTickProps }

  return (
    <div className="chart-wrap">
      {title && <p className="proj-chart__title">{title}</p>}

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={margin}
          style={{ cursor: onAreaClick ? 'pointer' : undefined }}
          onClick={(e) => {
            const val = e?.activeLabel
            if (onAreaClick && val) {
              onAreaClick(val === selectedValue ? '' : String(val))
            }
          }}
        >
          {allDefs.length > 0 && <GradientDefs defs={allDefs} />}

          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey={xKey} tick={xTick} unit={xUnit} />
          <YAxis tick={yTick} unit={yUnit} allowDecimals={false} />

          <Tooltip
            formatter={(v, name) => {
              const s = series.find((x) => x.dataKey === name)
              return [String(v ?? 0), s?.label ?? String(name)]
            }}
            contentStyle={TOOLTIP_STYLE}
          />

          {hasLegend && (
            <Legend
              formatter={(v) => series.find((x) => x.dataKey === v)?.label ?? v}
              wrapperStyle={{ fontSize: 10 }}
            />
          )}

          {referenceLines.map((rl, i) => (
            <ReferenceLine
              key={i}
              y={rl.y}
              stroke={rl.color ?? 'var(--text)'}
              strokeDasharray={rl.dash ?? '4 4'}
              label={rl.label ? { value: rl.label, fontSize: 9 } : undefined}
            />
          ))}

          {selectedValue && (
            <ReferenceLine
              x={selectedValue}
              stroke="var(--accent)"
              strokeWidth={2}
              strokeDasharray="4 3"
            />
          )}

          {resolvedSeries.map((s) => (
            <Area
              key={s.dataKey}
              type={s.type ?? 'monotone'}
              dataKey={s.dataKey}
              stroke={s.color}
              strokeWidth={s.strokeWidth ?? LINE_WIDTH}
              fill={s._fillId ? `url(#${s._fillId})` : s.color}
              fillOpacity={s._fillOpacity}
              dot={{ r: s.dotRadius ?? DOT_RADIUS, fill: s.color }}
              activeDot={{ r: (s.dotRadius ?? DOT_RADIUS) + 2 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      {axisLabel && <p className="proj-chart__axis-label">{axisLabel}</p>}
    </div>
  )
}
