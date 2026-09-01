// Registro central das chaves de localStorage usadas na aplicação —
// evita que duas partes do código declarem a mesma chave separadamente
// (e arrisquem divergir) ou cometam erro de digitação numa chave solta.
export const STORAGE_KEYS = {
  authToken:        'gd_auth_token',
  sidebarCollapsed: 'sidebar-collapsed',
  valoresPeriodo:   'fin-valores-period',
} as const;
