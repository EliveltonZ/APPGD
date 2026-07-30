import './Charts.css'
import { useId } from 'react'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { GradientDefs } from './GradientDefs'
import {
  AXIS_TICK,
  TOOLTIP_STYLE,
  BAR_MAX_SIZE,
  BAR_RADIUS,
  SERIES_COLORS,
  verticalGradient,
  horizontalGradient,
} from './tokens'
import type { GradientDef } from './tokens'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface BarGradientConfig {
  color:        string
  toColor?:     string   // cor no fim (default: mesma que color)
  fromOpacity?: number   // opacidade no topo/esquerda (default: 1)
  toOpacity?:   number   // opacidade na base/direita   (default: 0.25)
}

export interface BarSeriesConfig {
  dataKey:     string
  label?:      string                              // rótulo no tooltip / legenda
  color?:      string                              // cor sólida (sem gradiente)
  gradient?:   BarGradientConfig                  // atalho: gera um gradiente inline
  gradientId?: string                             // referencia um gradiente externo
  radius?:     [number, number, number, number]   // [tl, tr, br, bl] – default BAR_RADIUS
  maxBarSize?: number                             // px – default BAR_MAX_SIZE
  stackId?:    string                             // mesmo stackId = barra empilhada
  showLabels?: boolean                            // rótulo na ponta da barra
  minPointSize?: number
}

export interface RefLineConfig {
  y:      number
  color?: string
  dash?:  string
  label?: string
}

export interface ChartBarProps {
  data:      Record<string, unknown>[]
  series:    BarSeriesConfig[]

  /** Chave do eixo categórico (padrão: "name") */
  xKey?:     string

  /**
   * "column" → barras verticais (valor no eixo Y)
   * "bar"    → barras horizontais (valor no eixo X)
   * Padrão: "column"
   */
  variant?:  'column' | 'bar'

  height?:   number
  title?:    string
  axisLabel?: string
  showLegend?: boolean

  /** Gradientes externos (além dos gerados automaticamente via `gradient`) */
  gradients?: GradientDef[]

  referenceLines?: RefLineConfig[]

  /** Props extras para o eixo categórico (XAxis em column, YAxis em bar) */
  catTickProps?: object
  /** Props extras para o eixo de valor */
  valTickProps?: object
  /** Props extras diretas no componente XAxis/YAxis categórico (ex: interval, height) */
  catAxisProps?: object
  /** Props extras diretas no componente YAxis/XAxis de valor */
  valAxisProps?: object

  margin?: { top?: number; right?: number; bottom?: number; left?: number }
  xUnit?:  string
  yUnit?:  string

  /** Valor do eixo categórico atualmente selecionado (cross-filter) */
  selectedValue?: string
  /** Chamado ao clicar numa barra; recebe o valor do eixo categórico */
  onBarClick?: (value: string) => void
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function ChartBar({
  data,
  series,
  xKey       = 'name',
  variant    = 'column',
  height     = 260,
  title,
  axisLabel,
  showLegend,
  gradients: extraGradients = [],
  referenceLines = [],
  catTickProps,
  valTickProps,
  catAxisProps,
  valAxisProps,
  margin,
  xUnit,
  yUnit,
  selectedValue,
  onBarClick,
}: ChartBarProps) {
  const isBar = variant === 'bar'
  const uid = useId().replace(/:/g, '')

  // ── Gera gradientes inline e resolve os fills ─────────────────────────────
  const autoDefs: GradientDef[] = []

  const resolvedSeries = series.map((s, idx) => {
    const fallbackColor = SERIES_COLORS[idx % SERIES_COLORS.length]

    if (s.gradient) {
      const gradId = s.gradientId ?? `cbar-${uid}-${s.dataKey}-${idx}`
      const { color, toColor, fromOpacity = 1, toOpacity = 0.25 } = s.gradient
      const def = isBar
        ? horizontalGradient(gradId, color, fromOpacity, toOpacity)
        : verticalGradient(gradId, color, fromOpacity, toOpacity)

      if (toColor) {
        def.stops[1].color = toColor
      }

      autoDefs.push(def)
      return { ...s, _fill: `url(#${gradId})` }
    }

    if (s.gradientId) {
      return { ...s, _fill: `url(#${s.gradientId})` }
    }

    return { ...s, _fill: s.color ?? fallbackColor }
  })

  const allDefs = [...autoDefs, ...extraGradients]
  const hasLegend = showLegend ?? series.length > 1

  const catTick = { ...AXIS_TICK, ...catTickProps }
  const valTick = { ...AXIS_TICK, ...valTickProps }

  const defaultMargin = isBar
    ? { top: 4, right: 40, left: 80, bottom: 4 }
    : { top: 16, right: 8, left: 0, bottom: 4 }

  return (
    <div className="chart-wrap">
      {title && <p className="proj-chart__title">{title}</p>}

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={isBar ? 'vertical' : 'horizontal'}
          margin={margin ?? defaultMargin}
        >
          {allDefs.length > 0 && <GradientDefs defs={allDefs} />}

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            {...(isBar ? { horizontal: false } : { vertical: false })}
          />

          {isBar ? (
            <>
              <XAxis
                type="number"
                tick={valTick}
                unit={xUnit}
                allowDecimals={false}
                {...(valAxisProps as object)}
              />
              <YAxis
                type="category"
                dataKey={xKey}
                tick={catTick}
                width={76}
                {...(catAxisProps as object)}
              />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={catTick} unit={xUnit} {...(catAxisProps as object)} />
              <YAxis
                tick={valTick}
                unit={yUnit}
                allowDecimals={false}
                {...(valAxisProps as object)}
              />
            </>
          )}

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

          {resolvedSeries.map((s) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              fill={s._fill}
              radius={s.radius ?? BAR_RADIUS}
              maxBarSize={s.maxBarSize ?? BAR_MAX_SIZE}
              stackId={s.stackId}
              minPointSize={s.minPointSize}
              style={{ cursor: onBarClick ? 'pointer' : undefined }}
              onClick={(entry) => {
                if (!onBarClick) return
                const val = String((entry as unknown as Record<string, unknown>)[xKey])
                onBarClick(val === selectedValue ? '' : val)
              }}
            >
              {selectedValue && data.map((row, i) => (
                <Cell
                  key={i}
                  fill={s._fill}
                  fillOpacity={String(row[xKey]) === selectedValue ? 1 : 0.25}
                />
              ))}
              {s.showLabels && (
                <LabelList
                  dataKey={s.dataKey}
                  position={isBar ? 'right' : 'top'}
                  style={{ fontSize: 8, fill: 'var(--text)' }}
                />
              )}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>

      {axisLabel && <p className="proj-chart__axis-label">{axisLabel}</p>}
    </div>
  )
}
