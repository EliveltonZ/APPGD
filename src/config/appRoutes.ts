/**
 * FONTE ÚNICA DE VERDADE — rotas, permissões e grupos do menu lateral.
 *
 * Para adicionar uma nova rota:
 *   1. Adicione uma entrada em ROUTE_ITEMS abaixo.
 *   2. Crie o componente de página correspondente.
 *   3. Importe-o em main.tsx e adicione ao PAGE_MAP.
 *
 * Os grupos de menu, as permissões e os caminhos de rota são derivados
 * automaticamente deste arquivo — não é necessário editar nenhum outro arquivo
 * de configuração.
 */

import type { LucideIcon } from "lucide-react";
import {
  ShoppingBag,
  ShoppingCart,
  Factory,
  Truck,
  Wrench,
  DollarSign,
  BarChart2,
  Settings,
} from "lucide-react";

// ─── Grupos do menu lateral ───────────────────────────────────────────────────

export interface RouteGroup {
  id: string;
  label: string;
  icon: LucideIcon;
}

// prettier-ignore
export const ROUTE_GROUPS = [
  { id: 'pedidos',       label: 'Pedidos',      icon: ShoppingBag  },
  { id: 'compras',       label: 'Compras',       icon: ShoppingCart },
  { id: 'pcp',           label: 'PCP',           icon: Factory      },
  { id: 'logistica',     label: 'Logística',     icon: Truck        },
  { id: 'assistencias',  label: 'Assistências',  icon: Wrench       },
  { id: 'financeiro',    label: 'Financeiro',    icon: DollarSign   },
  { id: 'dashboards',    label: 'Dashboards',    icon: BarChart2    },
  { id: 'configuracoes', label: 'Configurações', icon: Settings     },
] as const satisfies RouteGroup[]

export type GroupId = (typeof ROUTE_GROUPS)[number]["id"];

// ─── Itens de rota ────────────────────────────────────────────────────────────

export interface RouteItem {
  /** Chave única de permissão — usada em UserPermissions */
  permissionKey: string;
  /** Caminho da URL */
  path: string;
  /** Grupo ao qual este item pertence */
  groupId: GroupId;
  /** Rótulo exibido no menu lateral */
  menuLabel: string;
  /**
   * true → rota raiz do grupo.
   * Fica acessível automaticamente se o usuário tiver qualquer permissão
   * dentro do mesmo grupo (lógica de acesso automático ao pai).
   */
  isGroupRoot?: boolean;
}

// prettier-ignore
export const ROUTE_ITEMS = [
  // ── Pedidos ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  { permissionKey: 'pedidos_novo',             path: '/pedidos/novo',            groupId: 'pedidos',       menuLabel: 'Novo Projeto'    },
  { permissionKey: 'pedidos_editar',           path: '/pedidos/editar',          groupId: 'pedidos',       menuLabel: 'Editar Projeto'  },
  { permissionKey: 'pedidos_excluir',          path: '/pedidos/excluir',         groupId: 'pedidos',       menuLabel: 'Excluir Projeto' },
  // ── Compras ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  { permissionKey: 'compras_lista',            path: '/compras/lista',           groupId: 'compras',       menuLabel: 'Compras',           isGroupRoot: true },
  { permissionKey: 'compras_pendencias',       path: '/compras/pendencias',      groupId: 'compras',       menuLabel: 'Pendências'         },
  // ── PCP ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  { permissionKey: 'pcp_painel',               path: '/pcp/painel',              groupId: 'pcp',           menuLabel: 'Painel PCP',        isGroupRoot: true },
  { permissionKey: 'pcp_producao',             path: '/pcp/producao',            groupId: 'pcp',           menuLabel: 'Produção'           },
  { permissionKey: 'pcp_expedicao',            path: '/pcp/expedicao',           groupId: 'pcp',           menuLabel: 'Expedição'          },
  { permissionKey: 'pcp_relatorios',           path: '/pcp/relatorios',          groupId: 'pcp',           menuLabel: 'Relatórios'         },
  // ── Logística ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  { permissionKey: 'logistica_status',         path: '/logistica/status',        groupId: 'logistica',     menuLabel: 'Status'             },
  { permissionKey: 'logistica_planejamento',   path: '/logistica/planejamento',  groupId: 'logistica',     menuLabel: 'Planejamento'       },
  // ── Assistências ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  { permissionKey: 'assistencias_nova',        path: '/assistencias/novo',       groupId: 'assistencias',  menuLabel: 'Nova Solicitação'   },
  { permissionKey: 'assistencias_producao',    path: '/assistencias/producao',   groupId: 'assistencias',  menuLabel: 'Produção'           },
  { permissionKey: 'assistencias_logistica',   path: '/assistencias/logistica',  groupId: 'assistencias',  menuLabel: 'Logística'          },
  { permissionKey: 'assistencias_qualidade',   path: '/assistencias/qualidade',  groupId: 'assistencias',  menuLabel: 'Qualidade'          },
  // ── Financeiro ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  { permissionKey: 'financeiro_valores',       path: '/financeiro/valores',      groupId: 'financeiro',    menuLabel: 'Valores'            },
  // ── Dashboards ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  { permissionKey: 'dashboards_principal',     path: '/dashboards/principal',    groupId: 'dashboards',    menuLabel: 'Dashboards',        isGroupRoot: true },
  // ── Configurações ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  { permissionKey: 'config_usuario',           path: '/configuracoes/usuario',   groupId: 'configuracoes', menuLabel: 'Novo Usuário'       },
  { permissionKey: 'config_senha',             path: '/configuracoes/senha',     groupId: 'configuracoes', menuLabel: 'Senha'              },
  { permissionKey: 'config_acessos',           path: '/configuracoes/acessos',   groupId: 'configuracoes', menuLabel: 'Acessos'            },
] as const satisfies ReadonlyArray<RouteItem>

/** União de todas as chaves de permissão válidas do sistema */
export type PermissionKey = (typeof ROUTE_ITEMS)[number]["permissionKey"];
