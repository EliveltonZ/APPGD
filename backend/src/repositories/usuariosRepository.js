const { Usuario } = require('../client/db');

const ACESSO_ATTRS = [
  'id', 'login', 'setor',
  'novoPedido', 'editarPedido', 'excluirPedido', 'compras',
  'pendencia', 'pcp', 'producao', 'expedicao', 'status', 'planejamento',
  'novaSolicitacao', 'producaoAssistencia', 'logisticaAssistencia',
  'qualidade', 'valores', 'dashboard', 'password',
  'acesso', 'relatorios', 'ativo',
  'cadastrosEquipe', 'cadastrosQualidade', 'cadastrosComercial',
  'cadastrosClientes', 'cadastrosUsuarios', 'apontamento',
  'paradasMaquina', 'paradasAdmin',
];

// Converte instância Sequelize (camelCase) para plain object com chaves snake_case
// que correspondem às colunas DB e ao que toAuthUser() e requirePermission() esperam.
function rowToSnake(r) {
  return {
    id:                    r.id,
    login:                 r.login,
    setor:                 r.setor,
    novo_pedido:           r.novoPedido           ?? false,
    editar_pedido:         r.editarPedido         ?? false,
    excluir_pedido:        r.excluirPedido        ?? false,
    compras:               r.compras              ?? false,
    pendencia:             r.pendencia            ?? false,
    pcp:                   r.pcp                  ?? false,
    producao:              r.producao             ?? false,
    expedicao:             r.expedicao            ?? false,
    status:                r.status               ?? false,
    planejamento:          r.planejamento         ?? false,
    nova_solicitacao:      r.novaSolicitacao      ?? false,
    producao_assistencia:  r.producaoAssistencia  ?? false,
    logistica_assistencia: r.logisticaAssistencia ?? false,
    qualidade:             r.qualidade            ?? false,
    valores:               r.valores              ?? false,
    dashboard:             r.dashboard            ?? false,
    password:              r.password             ?? false,
    acesso:                r.acesso               ?? false,
    relatorios:            r.relatorios           ?? false,
    ativo:                 r.ativo                ?? false,
    cadastros_equipe:      r.cadastrosEquipe      ?? false,
    cadastros_qualidade:   r.cadastrosQualidade   ?? false,
    cadastros_comercial:   r.cadastrosComercial   ?? false,
    cadastros_clientes:    r.cadastrosClientes    ?? false,
    cadastros_usuarios:    r.cadastrosUsuarios    ?? false,
    apontamento:           r.apontamento          ?? false,
    paradas_maquina:       r.paradasMaquina       ?? false,
    paradas_admin:         r.paradasAdmin         ?? false,
  };
}

async function buscarMaiorId() {
  const max = await Usuario.max('id');
  return [{ max_id: max ?? 0 }];
}

async function inserirUsuario(body) {
  // Sequelize gera OVERRIDING SYSTEM VALUE automaticamente quando id é fornecido
  // em colunas com autoIncrementIdentity: true no PostgreSQL
  await Usuario.create({
    id:       body.p_id,
    login:    body.p_login    ?? null,
    senha:    body.p_senha    ?? null,
    setor:    body.p_setor    ?? null,
    camiseta: body.p_camiseta ?? null,
    calca:    body.p_calca    ?? null,
    sapato:   body.p_sapato   ?? null,
    local:    body.p_local    ?? null,
  });
}

async function listarAcessos() {
  const rows = await Usuario.findAll({
    where:      { ativo: true },
    attributes: ACESSO_ATTRS,
    order:      [['id', 'ASC']],
  });
  return rows.map(rowToSnake);
}

async function buscarAcesso(p_id) {
  const rows = await Usuario.findAll({
    where:      { id: Number(p_id) },
    attributes: ACESSO_ATTRS,
  });
  return rows.map(rowToSnake);
}

async function atualizarAcessos(body) {
  await Usuario.update(
    {
      novoPedido:           body.p_novo_pedido           ?? false,
      editarPedido:         body.p_editar_pedido         ?? false,
      excluirPedido:        body.p_excluir_pedido        ?? false,
      compras:              body.p_compras               ?? false,
      pendencia:            body.p_pendencia             ?? false,
      pcp:                  body.p_pcp                   ?? false,
      producao:             body.p_producao              ?? false,
      expedicao:            body.p_expedicao             ?? false,
      status:               body.p_status                ?? false,
      planejamento:         body.p_planejamento          ?? false,
      novaSolicitacao:      body.p_nova_solicitacao      ?? false,
      producaoAssistencia:  body.p_producao_assistencia  ?? false,
      logisticaAssistencia: body.p_logistica_assistencia ?? false,
      qualidade:            body.p_qualidade             ?? false,
      valores:              body.p_valores               ?? false,
      dashboard:            body.p_dashboard             ?? false,
      password:             body.p_password              ?? false,
      acesso:               body.p_acesso                ?? false,
      relatorios:           body.p_relatorios            ?? false,
      cadastrosEquipe:      body.p_cadastros_equipe      ?? false,
      cadastrosQualidade:   body.p_cadastros_qualidade   ?? false,
      cadastrosComercial:   body.p_cadastros_comercial   ?? false,
      cadastrosClientes:    body.p_cadastros_clientes    ?? false,
      cadastrosUsuarios:    body.p_cadastros_usuarios    ?? false,
      apontamento:          body.p_apontamento           ?? false,
      paradasMaquina:       body.p_paradas_maquina       ?? false,
      paradasAdmin:         body.p_paradas_admin         ?? false,
    },
    { where: { id: body.p_id } }
  );
}

async function listarTodosUsuarios() {
  return Usuario.findAll({
    attributes: ['id', 'login', 'setor', 'local', 'camiseta', 'calca', 'sapato', 'ativo'],
    order:      [['id', 'ASC']],
    raw:        true,
  });
}

async function atualizarUsuario(id, data) {
  await Usuario.update(
    {
      login:    data.login    ?? null,
      setor:    data.setor    ?? null,
      local:    data.local    ?? null,
      camiseta: data.camiseta ?? null,
      calca:    data.calca    ?? null,
      sapato:   data.sapato   ?? null,
      ativo:    Boolean(data.ativo),
    },
    { where: { id: Number(id) } }
  );
}

async function alterarSenha(p_id, p_senha) {
  await Usuario.update({ senha: p_senha }, { where: { id: Number(p_id) } });
}

module.exports = {
  buscarMaiorId,
  inserirUsuario,
  listarAcessos,
  buscarAcesso,
  atualizarAcessos,
  alterarSenha,
  listarTodosUsuarios,
  atualizarUsuario,
};
