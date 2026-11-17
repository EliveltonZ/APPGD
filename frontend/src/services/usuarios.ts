import { apiGet, apiPost, apiPut } from './api';
import { emptyPermissions } from '../types/auth';
import type { AuthUser, UserPermissions } from '../types/auth';

type RawRow = Record<string, unknown>;

export async function fetchMaxUserId(): Promise<number> {
  const rows = await apiGet<RawRow[]>('/usuarios/max-id');
  return Number(rows[0]?.max_id ?? 0) + 1;
}

export interface NewUserPayload {
  id:        number;
  login:     string;
  senha:     string;
  setor:     string;
  camiseta:  string;
  calca:     string;
  sapato:    string;
  local:     string;
}

export async function insertUser(payload: NewUserPayload): Promise<void> {
  await apiPost('/usuarios/', payload);
}

type RawAcesso = Record<string, unknown>;

export function toAuthUser(r: RawAcesso): AuthUser {
  const permissions: UserPermissions = {
    ...emptyPermissions(),
    pedidos_novo:              Boolean(r.novo_pedido),
    pedidos_editar:            Boolean(r.editar_pedido),
    pedidos_excluir:           Boolean(r.excluir_pedido),
    compras_lista:             Boolean(r.compras),
    compras_pendencias:        Boolean(r.pendencia),
    pcp_painel:                Boolean(r.pcp),
    pcp_producao:              Boolean(r.producao),
    pcp_expedicao:             Boolean(r.expedicao),
    pcp_relatorios:            Boolean(r.relatorios),
    logistica_status:          Boolean(r.status),
    logistica_planejamento:    Boolean(r.planejamento),
    assistencias_nova:         Boolean(r.nova_solicitacao),
    assistencias_producao:     Boolean(r.producao_assistencia),
    assistencias_logistica:    Boolean(r.logistica_assistencia),
    assistencias_qualidade:    Boolean(r.qualidade),
    financeiro_valores:        Boolean(r.valores),
    dashboards_principal:      Boolean(r.dashboard),
    config_senha:              Boolean(r.password),
    config_acessos:            Boolean(r.acesso),
    // Mesma permissão de config_acessos, exibida como item de menu
    // separado — não tem coluna própria no banco (ver appRoutes.ts).
    config_terminal_pin:       Boolean(r.acesso),
    cadastros_equipe:          Boolean(r.cadastros_equipe),
    cadastros_qualidade:       Boolean(r.cadastros_qualidade),
    cadastros_comercial:       Boolean(r.cadastros_comercial),
    cadastros_clientes:        Boolean(r.cadastros_clientes),
    cadastros_usuarios:        Boolean(r.cadastros_usuarios),
    cadastros_impressao_cracha: Boolean(r.cadastros_usuarios),
    cadastros_materiais:       Boolean(r.cadastros_materiais),
    cadastros_localizacoes:    Boolean(r.cadastros_localizacoes),
    cadastros_fornecedores:    Boolean(r.cadastros_fornecedores),
    pcp_apontamento:           Boolean(r.apontamento),
    paradas_maquina:           Boolean(r.paradas_maquina),
    paradas_admin:             Boolean(r.paradas_admin),
    almoxarifado_transferencias: Boolean(r.almoxarifado_transferencias),
    almoxarifado_estoque:     Boolean(r.almoxarifado_estoque),
    almoxarifado_baixas:      Boolean(r.almoxarifado_baixas),
    almoxarifado_nota_fiscal: Boolean(r.almoxarifado_nota_fiscal),
    almoxarifado_ajuste:      Boolean(r.almoxarifado_ajuste),
    almoxarifado_vinculos:    Boolean(r.almoxarifado_vinculos),
    compras_liberacoes:       Boolean(r.compras_liberacoes),
    compras_necessidades:     Boolean(r.compras_necessidades),
    compras_confirmar:        Boolean(r.compras_confirmar),
    compras_pedidos:          Boolean(r.compras_pedidos),
    estoque_reservar:              Boolean(r.estoque_reservar),
    compras_lancamento_acessorios: Boolean(r.compras_lancamento_acessorios),
    fabrica_solicitacao_interna:   Boolean(r.fabrica_solicitacao_interna),
  };
  return {
    id:          String(r.id    ?? ''),
    nome:        String(r.login ?? ''),
    role:        String(r.setor ?? ''),
    permissions,
  };
}

export async function fetchUserName(id: number): Promise<{ nome: string; ativo: boolean } | null> {
  const rows = await apiGet<{ nome: string; ativo: boolean }[]>('/auth/usuario', { id });
  if (!rows.length || !rows[0].nome) return null;
  return { nome: rows[0].nome, ativo: Boolean(rows[0].ativo) };
}

export async function fetchAcessos(): Promise<AuthUser[]> {
  const rows = await apiGet<RawAcesso[]>('/usuarios/listar-acessos');
  return rows.map(toAuthUser);
}

export async function checkPassword(id: number, senha: string): Promise<boolean> {
  try {
    const resp = await apiPost<{ token: string }>('/auth/login', { id, senha });
    return !!resp?.token;
  } catch {
    return false;
  }
}

export async function loginUser(
  id: number,
  senha: string,
): Promise<{ authUser: AuthUser; token: string } | null> {
  type LoginResponse = { token: string; user: { sub: number; nome: string; permissoes: RawAcesso } };
  let resp: LoginResponse;
  try {
    resp = await apiPost<LoginResponse>('/auth/login', { id, senha });
  } catch {
    return null;
  }
  if (!resp?.token) return null;
  const authUser = toAuthUser({ ...resp.user.permissoes, id: resp.user.sub, login: resp.user.nome });
  return { authUser, token: resp.token };
}

export interface UserRecord {
  id:       number
  login:    string
  setor:    string
  local:    string
  camiseta: string
  calca:    string
  sapato:   string
  ativo:    boolean
  crachaHash?: string | null
}

export async function fetchAllUsers(): Promise<UserRecord[]> {
  return apiGet<UserRecord[]>('/usuarios/todos')
}

// Gera (ou regenera) o hash do crachá — terminal público de apontamento lê
// esse código no lugar de digitar o ID do operador.
export async function gerarCracha(id: number): Promise<string> {
  const r = await apiPost<{ hash: string }>(`/usuarios/${id}/cracha`, {})
  return r.hash
}

export async function updateUser(id: number, data: Omit<UserRecord, 'id'>): Promise<void> {
  await apiPut(`/usuarios/${id}`, data)
}

export async function updateSenha(id: number, senha: string): Promise<void> {
  await apiPost('/senha/', { id, senha });
}

export async function saveAcessos(id: number, permissions: UserPermissions): Promise<void> {
  await apiPost('/usuarios/acessos', {
    id,
    novo_pedido:           permissions.pedidos_novo,
    editar_pedido:         permissions.pedidos_editar,
    excluir_pedido:        permissions.pedidos_excluir,
    compras:               permissions.compras_lista,
    pendencia:             permissions.compras_pendencias,
    pcp:                   permissions.pcp_painel,
    producao:              permissions.pcp_producao,
    expedicao:             permissions.pcp_expedicao,
    status:                permissions.logistica_status,
    planejamento:          permissions.logistica_planejamento,
    nova_solicitacao:      permissions.assistencias_nova,
    producao_assistencia:  permissions.assistencias_producao,
    logistica_assistencia: permissions.assistencias_logistica,
    qualidade:             permissions.assistencias_qualidade,
    valores:               permissions.financeiro_valores,
    dashboard:             permissions.dashboards_principal,
    password:              permissions.config_senha,
    // config_terminal_pin é a mesma permissão exibida como item separado
    // (sem coluna própria) — qualquer um dos dois marcados já libera.
    acesso:                permissions.config_acessos || permissions.config_terminal_pin,
    relatorios:            permissions.pcp_relatorios,
    cadastros_equipe:      permissions.cadastros_equipe,
    cadastros_qualidade:   permissions.cadastros_qualidade,
    cadastros_comercial:   permissions.cadastros_comercial,
    cadastros_clientes:    permissions.cadastros_clientes,
    cadastros_usuarios:    permissions.cadastros_usuarios || permissions.cadastros_impressao_cracha,
    cadastros_materiais:    permissions.cadastros_materiais,
    cadastros_localizacoes: permissions.cadastros_localizacoes,
    cadastros_fornecedores: permissions.cadastros_fornecedores,
    apontamento:            permissions.pcp_apontamento,
    paradas_maquina:       permissions.paradas_maquina,
    paradas_admin:         permissions.paradas_admin,
    almoxarifado_transferencias: permissions.almoxarifado_transferencias,
    compras_liberacoes:       permissions.compras_liberacoes,
    compras_necessidades:     permissions.compras_necessidades,
    compras_confirmar:        permissions.compras_confirmar,
    compras_pedidos:          permissions.compras_pedidos,
    almoxarifado_estoque:     permissions.almoxarifado_estoque,
    almoxarifado_baixas:      permissions.almoxarifado_baixas,
    almoxarifado_nota_fiscal: permissions.almoxarifado_nota_fiscal,
    almoxarifado_ajuste:      permissions.almoxarifado_ajuste,
    almoxarifado_vinculos:    permissions.almoxarifado_vinculos,
    estoque_reservar:              permissions.estoque_reservar,
    compras_lancamento_acessorios: permissions.compras_lancamento_acessorios,
    fabrica_solicitacao_interna:   permissions.fabrica_solicitacao_interna,
  });
}
