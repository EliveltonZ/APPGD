/**
 * Tokens compartilhados para todos os gráficos do sistema.
 * Paleta validada (CVD-safe) seguindo o método dataviz.
 */

// Paleta categórica — 8 slots em ordem CVD-safe
export const SERIES_COLORS = [
  "#2a78d6", // 1 · blue
  "#eb6834", // 2 · orange
  "#1baf7a", // 3 · aqua
  "#eda100", // 4 · yellow
  "#e87ba4", // 5 · magenta
  "#008300", // 6 · green
  "#4a3aa7", // 7 · violet
  "#e34948", // 8 · red
] as const;

// Marcas
export const BAR_MAX_SIZE = 24;
export const LINE_WIDTH = 2;
export const DOT_RADIUS = 3;
export const AREA_OPACITY = 0.12;

// Raio padrão: arredondado na ponta, quadrado na baseline
export const BAR_RADIUS: [number, number, number, number] = [8, 8, 0, 0];

// Estilos de texto nos eixos / tooltip
export const AXIS_TICK = { fontSize: 9 } as const;
export const TOOLTIP_STYLE = {
  fontSize: 11,
  borderRadius: 6,
  border: "1px solid var(--border)",
  background: "var(--bg)",
  color: "var(--text-h)",
} as const;

// ─── Gradientes ──────────────────────────────────────────────────────────────

export interface GradientStop {
  offset: string;
  color: string;
  opacity: number;
}

export interface GradientDef {
  id: string;
  x1?: string;
  y1?: string;
  x2?: string;
  y2?: string;
  stops: GradientStop[];
}

/** Gradiente vertical: cor sólida no topo → transparente na base (colunas) */
export function verticalGradient(
  id: string,
  color: string,
  fromOpacity = 1,
  toOpacity = 0.25,
): GradientDef {
  return {
    id,
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1",
    stops: [
      { offset: "0%", color, opacity: fromOpacity },
      { offset: "100%", color, opacity: toOpacity },
    ],
  };
}

/** Gradiente horizontal: cor sólida à esquerda → transparente à direita (barras) */
export function horizontalGradient(
  id: string,
  color: string,
  fromOpacity = 1,
  toOpacity = 0.25,
): GradientDef {
  return {
    id,
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "0",
    stops: [
      { offset: "0%", color, opacity: fromOpacity },
      { offset: "100%", color, opacity: toOpacity },
    ],
  };
}
