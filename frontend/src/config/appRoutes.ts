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
  Database,
  Package,
} from "lucide-react";

// ─── Grupos do menu lateral ───────────────────────────────────────────────────

export interface RouteGroup {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const ROUTE_GROUPS = [
  { id: "pedidos", label: "Pedidos", icon: ShoppingBag },
  { id: "compras", label: "Compras", icon: ShoppingCart },
  { id: "fabrica", label: "Fábrica", icon: Factory },
  { id: "logistica", label: "Logística", icon: Truck },
  { id: "assistencias", label: "Assistências", icon: Wrench },
  { id: "financeiro", label: "Financeiro", icon: DollarSign },
  { id: "dashboards", label: "Dashboards", icon: BarChart2 },
  { id: "configuracoes", label: "Configurações", icon: Settings },
  { id: "cadastros", label: "Cadastros", icon: Database },
  { id: "almoxarifado", label: "Almoxarifado", icon: Package },
] as const satisfies RouteGroup[];

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
  /**
   * true → permissão existe no sistema mas não aparece no menu lateral.
   * Usada para permissões complementares que concedem acesso à mesma rota.
   */
  hidden?: boolean;
}

function buildSidebarList(
  permissionKey: RouteItem["permissionKey"],
  path: RouteItem["path"],
  groupId: RouteItem["groupId"],
  menuLabel: RouteItem["menuLabel"],
  isGroupRoot?: boolean,
  hidden?: boolean,
): RouteItem {
  return {
    permissionKey,
    path,
    groupId,
    menuLabel,
    isGroupRoot,
    hidden,
  };
}

// prettier-ignore
export const ROUTE_ITEMS = [
  // ── Pedidos ────────────────────────────────────────────────────────────────
  buildSidebarList('pedidos_novo', '/pedidos/novo', 'pedidos', 'Novo Pedido'),
  buildSidebarList('pedidos_editar', '/pedidos/editar', 'pedidos', 'Editar Pedido'),
  buildSidebarList('pedidos_excluir', '/pedidos/excluir', 'pedidos', 'Excluir Pedido'),
  // ── Compras ────────────────────────────────────────────────────────────────

  buildSidebarList('compras_lista', '/compras/lista', 'compras', 'Compras', true),
  buildSidebarList('compras_pendencias', '/compras/pendencias', 'compras', 'Pendências'),
  
  // ── PCP ────────────────────────────────────────────────────────────────────
  buildSidebarList('pcp_painel', '/fabrica/pcp', 'fabrica', 'Painel PCP'),
  buildSidebarList('pcp_producao', '/fabrica/producao', 'fabrica', 'Produção'),
  buildSidebarList('pcp_apontamento', '/fabrica/apontamento', 'fabrica', 'Apontamento'),
  buildSidebarList('pcp_expedicao', '/fabrica/expedicao', 'fabrica', 'Expedição'),
  buildSidebarList('pcp_relatorios', '/fabrica/relatorios', 'fabrica', 'Relatórios'),
  buildSidebarList('paradas_maquina', '/fabrica/paradas', 'fabrica', 'Paradas'),
  buildSidebarList('paradas_admin', '/fabrica/paradas', 'fabrica', 'Paradas Admin', false, true),

  // ── Logística ──────────────────────────────────────────────────────────────
  buildSidebarList('logistica_status', '/logistica/status', 'logistica', 'Status'),
  buildSidebarList('logistica_planejamento', '/logistica/planejamento', 'logistica', 'Planejamento'),

  // ── Assistências ───────────────────────────────────────────────────────────
  buildSidebarList('assistencias_nova', '/assistencias/novo', 'assistencias', 'Nova Solicitação'),
  buildSidebarList('assistencias_nova', '/pedidos/editar', 'assistencias', 'Editar Assistência', false, true),
  buildSidebarList('assistencias_nova', '/pedidos/excluir', 'assistencias', 'Excluir Assistência', false, true),
  buildSidebarList('assistencias_producao', '/assistencias/producao', 'assistencias', 'Produção'),
  buildSidebarList('assistencias_logistica', '/assistencias/logistica', 'assistencias', 'Logística'),
  buildSidebarList('assistencias_qualidade', '/assistencias/qualidade', 'assistencias', 'Qualidade'),

  // ── Financeiro ─────────────────────────────────────────────────────────────
  buildSidebarList('financeiro_valores', '/financeiro/valores', 'financeiro', 'Valores'),

  // ── Dashboards ─────────────────────────────────────────────────────────────
  buildSidebarList('dashboards_principal', '/dashboards/principal', 'dashboards', 'Dashboards', true),

  // ── Configurações ──────────────────────────────────────────────────────────

  buildSidebarList('config_senha', '/configuracoes/senha', 'configuracoes', 'Senha'),
  buildSidebarList('config_acessos', '/configuracoes/acessos', 'configuracoes', 'Acessos'),
  // ── Cadastros ──────────────────────────────────────────────────────────────

  buildSidebarList('cadastros_equipe', '/cadastros/equipe', 'cadastros', 'Equipe'),
  buildSidebarList('cadastros_qualidade', '/cadastros/qualidade', 'cadastros', 'Qualidade'),
  buildSidebarList('cadastros_comercial', '/cadastros/comercial', 'cadastros', 'Comercial'),
  buildSidebarList('cadastros_clientes', '/cadastros/clientes', 'cadastros', 'Clientes'),
  buildSidebarList('cadastros_usuarios', '/cadastros/usuarios', 'cadastros', 'Usuários'),
  buildSidebarList('cadastros_materiais', '/cadastros/materiais', 'cadastros', 'Materiais'),
  buildSidebarList('cadastros_localizacoes', '/cadastros/localizacoes', 'cadastros', 'Localizações'),

  // ── Almoxarifado ───────────────────────────────────────────────────────────
  buildSidebarList(
    'almoxarifado_transferencias',
    '/almoxarifado/transferencias',
    'almoxarifado',
    'Transferências'
  ),

] as const satisfies ReadonlyArray<RouteItem>;

/** União de todas as chaves de permissão válidas do sistema */
export type PermissionKey = (typeof ROUTE_ITEMS)[number]["permissionKey"];
