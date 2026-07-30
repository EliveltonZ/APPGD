export interface DashboardRecord {
  id: number;
  ambiente: string;
  vendedor: string;
  liberador: string;
  loja: 420 | 421 | 422;
  mes: string; // YYYY-MM
}

export const DASH_AMBIENTES = [
  'ADEGA', 'APARTAMENTO SUITE', 'ÁREA DE CIRCULAÇÃO', 'ÁREA DE SERVIÇO',
  'BANHEIRO SOCIAL', 'BANHEIRO SUITE', 'CLOSET', 'COMPLEMENTO+',
  'COZINHA', 'COZINHA AUXILIAR', 'DESPENSA', 'DORMITÓRIO CASAL',
  'DORMITÓRIO INFANTIL', 'DORMITÓRIO SOCIAL', 'ESPAÇO GOURMET',
  'HALL DE ENTRADA', 'HOME OFFICE', 'LAVANDERIA', 'SALA DE ESTAR',
  'SALA DE JANTAR', 'VARANDA',
];

export const DASH_VENDEDORES = [
  'ALEXANDRE', 'ANA CASTRO', 'ANDREIA DESSIA', 'DEBIA CARLO', 'EDUARDO CARLOS',
  'ELIAN VIEIRA', 'FLAVIO SANTOS', 'GABRIEL IRES', 'GABRIEL RODRIGUES',
  'JHONATHAN ML', 'JOAO TIMOTEO', 'LEANDRO NERES', 'MARILIA COSTA',
  'MATHEUS ROSSINI', 'MAURICIO NUNES', 'PAULO JUNIOR', 'PRISCILA JERON',
  'RAFAEL AMORIM', 'RICARDO FERREIRA', 'ROSANA LEMOS', 'ROSE ROSSINI',
  'ROSELI TONELI', 'ROSSANA ROSSINI', 'SUELLEN SILVA', 'TOMAS VALFOGO',
  'VINICIUS ROSSINI', 'WAGNER FERNANDES',
];

export const DASH_LIBERADORES = [
  'ALINNE ARAUJO', 'AYTON JUNIOR', 'CRISTINA FRANCA', 'GABRIEL BELO',
  'GABRIEL IRES', 'INES ROSSINI', 'LAIS', 'LARISSA GABRIELA',
  'LIVIA BERNARDL', 'LUCIANE', 'MANUELA NUNES', 'MATHEUS ROSSINI',
  'MONALISA', 'RENATO', 'ROSELI TONELI', 'THAYS CAMPOS', 'VINICIUS',
];

// Ambient distribution — total 923
const AMBIENT_DIST: Array<[string, number]> = [
  ['ADEGA', 4], ['APARTAMENTO SUITE', 39], ['ÁREA DE CIRCULAÇÃO', 16],
  ['ÁREA DE SERVIÇO', 48], ['BANHEIRO SOCIAL', 95], ['BANHEIRO SUITE', 126],
  ['CLOSET', 25], ['COMPLEMENTO+', 4], ['COZINHA', 129], ['COZINHA AUXILIAR', 79],
  ['DESPENSA', 5], ['DORMITÓRIO CASAL', 117], ['DORMITÓRIO INFANTIL', 80],
  ['DORMITÓRIO SOCIAL', 32], ['ESPAÇO GOURMET', 44], ['HALL DE ENTRADA', 17],
  ['HOME OFFICE', 20], ['LAVANDERIA', 1], ['SALA DE ESTAR', 12],
  ['SALA DE JANTAR', 17], ['VARANDA', 13],
];

// Loja weights → ~449 / 82 / 392
const LOJA_W   = [0.486, 0.089, 0.425];
// Monthly weights → 116/89/64/95/87/63/42/45/48/93/77/104
const MONTH_W  = [0.1257,0.0965,0.0694,0.1030,0.0943,0.0683,0.0455,0.0488,0.0520,0.1008,0.0835,0.1128];
// Vendedor weights — a few peaks
const VEND_W   = DASH_VENDEDORES.map((_, i) =>
  ({ 5: 4.0, 19: 3.8, 2: 3.2, 3: 3.5, 12: 2.0 } as Record<number,number>)[i] ?? 1.0);
// Liberador weights — LARISSA highest
const LIB_W    = DASH_LIBERADORES.map((_, i) =>
  ({ 7: 5.0, 11: 3.0, 3: 2.5, 4: 2.5 } as Record<number,number>)[i] ?? 1.0);

function wRand(weights: number[], seed: { v: number }): number {
  seed.v = (seed.v * 1664525 + 1013904223) >>> 0;
  const total = weights.reduce((a, b) => a + b, 0);
  let r = (seed.v / 0x100000000) * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

function generate(): DashboardRecord[] {
  const recs: DashboardRecord[] = [];
  const seed = { v: 42 };
  let id = 1;
  const lojas = [420, 421, 422] as const;

  for (const [amb, count] of AMBIENT_DIST) {
    for (let i = 0; i < count; i++) {
      recs.push({
        id: id++,
        ambiente:  amb,
        vendedor:  DASH_VENDEDORES[wRand(VEND_W,  seed)],
        liberador: DASH_LIBERADORES[wRand(LIB_W, seed)],
        loja:      lojas[wRand(LOJA_W,   seed)],
        mes:       `2025-${String(wRand(MONTH_W, seed) + 1).padStart(2, '0')}`,
      });
    }
  }
  return recs;
}

export const DASHBOARD_RECORDS: DashboardRecord[] = generate();