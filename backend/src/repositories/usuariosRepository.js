const bcrypt  = require('bcryptjs');
const { Usuario } = require('../client/db');

const BCRYPT_ROUNDS = 12;

const ACESSO_ATTRS = [
  'id', 'login', 'setor',
  'novoPedido', 'editarPedido', 'excluirPedido', 'compras',
  'pendencia', 'pcp', 'producao', 'expedicao', 'status', 'planejamento',
  'novaSolicitacao', 'producaoAssistencia', 'logisticaAssistencia',
  'qualidade', 'valores', 'dashboard', 'password',
  'acesso', 'relatorios', 'ativo',
  'cadastrosEquipe', 'cadastrosQualidade', 'cadastrosComercial',
  'cadastrosClientes', 'cadastrosUsuarios', 'cadastrosMateriais', 'cadastrosLocalizacoes', 'apontamento',
  'paradasMaquina', 'paradasAdmin',
  'almoxarifadoTransferencias',
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
    cadastros_materiais:   r.cadastrosMateriais    ?? false,
    cadastros_localizacoes:r.cadastrosLocalizacoes ?? false,
    apontamento:           r.apontamento           ?? false,
    paradas_maquina:       r.paradasMaquina       ?? false,
    paradas_admin:         r.paradasAdmin         ?? false,
    almoxarifado_transferencias: r.almoxarifadoTransferencias ?? false,
  };
}

async function buscarMaiorId() {
  const max = await Usuario.max('id');
  return [{ max_id: max ?? 0 }];
}

async function inserirUsuario(body) {
  const senha = String(body.senha ?? '');
  if (senha.length < 6) throw new Error('A senha deve ter ao menos 6 caracteres.');
  const senhaHash = await bcrypt.hash(senha, BCRYPT_ROUNDS);
  await Usuario.create({
    id:       body.id,
    login:    body.login    ?? null,
    senha:    senhaHash,
    setor:    body.setor    ?? null,
    camiseta: body.camiseta ?? null,
    calca:    body.calca    ?? null,
    sapato:   body.sapato   ?? null,
    local:    body.local    ?? null,
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

async function buscarAcesso(id) {
  const rows = await Usuario.findAll({
    where:      { id: Number(id) },
    attributes: ACESSO_ATTRS,
  });
  return rows.map(rowToSnake);
}

async function atualizarAcessos(body) {
  await Usuario.update(
    {
      novoPedido:           body.novo_pedido           ?? false,
      editarPedido:         body.editar_pedido         ?? false,
      excluirPedido:        body.excluir_pedido        ?? false,
      compras:              body.compras               ?? false,
      pendencia:            body.pendencia             ?? false,
      pcp:                  body.pcp                   ?? false,
      producao:             body.producao              ?? false,
      expedicao:            body.expedicao             ?? false,
      status:               body.status                ?? false,
      planejamento:         body.planejamento          ?? false,
      novaSolicitacao:      body.nova_solicitacao      ?? false,
      producaoAssistencia:  body.producao_assistencia  ?? false,
      logisticaAssistencia: body.logistica_assistencia ?? false,
      qualidade:            body.qualidade             ?? false,
      valores:              body.valores               ?? false,
      dashboard:            body.dashboard             ?? false,
      password:             body.password              ?? false,
      acesso:               body.acesso                ?? false,
      relatorios:           body.relatorios            ?? false,
      cadastrosEquipe:      body.cadastros_equipe      ?? false,
      cadastrosQualidade:   body.cadastros_qualidade   ?? false,
      cadastrosComercial:   body.cadastros_comercial   ?? false,
      cadastrosClientes:    body.cadastros_clientes    ?? false,
      cadastrosUsuarios:    body.cadastros_usuarios    ?? false,
      cadastrosMateriais:    body.cadastros_materiais    ?? false,
      cadastrosLocalizacoes: body.cadastros_localizacoes ?? false,
      apontamento:           body.apontamento            ?? false,
      paradasMaquina:       body.paradas_maquina       ?? false,
      paradasAdmin:         body.paradas_admin         ?? false,
      almoxarifadoTransferencias: body.almoxarifado_transferencias ?? false,
    },
    { where: { id: body.id } }
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
  const senha = String(p_senha ?? '');
  if (senha.length < 6) throw new Error('A senha deve ter ao menos 6 caracteres.');
  const senhaHash = await bcrypt.hash(senha, BCRYPT_ROUNDS);
  await Usuario.update({ senha: senhaHash }, { where: { id: Number(p_id) } });
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
