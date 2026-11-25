const bcrypt  = require('bcryptjs');
const crypto  = require('crypto');
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
  'almoxarifadoTransferencias', 'cadastrosFornecedores',
  'comprasLiberacoes', 'comprasNecessidades', 'comprasConfirmar', 'comprasPedidos',
  'almoxarifadoEstoque', 'almoxarifadoBaixas', 'almoxarifadoNotaFiscal',
  'almoxarifadoAjuste', 'almoxarifadoVinculos',
  'estoqueReservar', 'comprasLancamentoAcessorios', 'fabricaSolicitacaoInterna',
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
    cadastros_fornecedores: r.cadastrosFornecedores ?? false,
    compras_liberacoes:       r.comprasLiberacoes       ?? false,
    compras_necessidades:     r.comprasNecessidades     ?? false,
    compras_confirmar:        r.comprasConfirmar         ?? false,
    compras_pedidos:          r.comprasPedidos           ?? false,
    almoxarifado_estoque:     r.almoxarifadoEstoque      ?? false,
    almoxarifado_baixas:      r.almoxarifadoBaixas       ?? false,
    almoxarifado_nota_fiscal: r.almoxarifadoNotaFiscal   ?? false,
    almoxarifado_ajuste:      r.almoxarifadoAjuste       ?? false,
    almoxarifado_vinculos:    r.almoxarifadoVinculos     ?? false,
    estoque_reservar:              r.estoqueReservar              ?? false,
    compras_lancamento_acessorios: r.comprasLancamentoAcessorios  ?? false,
    fabrica_solicitacao_interna:   r.fabricaSolicitacaoInterna    ?? false,
  };
}

async function buscarParaLogin(id) {
  return Usuario.findOne({ where: { id: Number(id), ativo: true } });
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
      cadastrosFornecedores: body.cadastros_fornecedores ?? false,
      comprasLiberacoes:     body.compras_liberacoes       ?? false,
      comprasNecessidades:   body.compras_necessidades     ?? false,
      comprasConfirmar:      body.compras_confirmar        ?? false,
      comprasPedidos:        body.compras_pedidos          ?? false,
      almoxarifadoEstoque:   body.almoxarifado_estoque     ?? false,
      almoxarifadoBaixas:    body.almoxarifado_baixas      ?? false,
      almoxarifadoNotaFiscal: body.almoxarifado_nota_fiscal ?? false,
      almoxarifadoAjuste:    body.almoxarifado_ajuste      ?? false,
      almoxarifadoVinculos:  body.almoxarifado_vinculos    ?? false,
      estoqueReservar:             body.estoque_reservar              ?? false,
      comprasLancamentoAcessorios: body.compras_lancamento_acessorios ?? false,
      fabricaSolicitacaoInterna:   body.fabrica_solicitacao_interna   ?? false,
    },
    { where: { id: body.id } }
  );
}

async function listarTodosUsuarios() {
  return Usuario.findAll({
    attributes: ['id', 'login', 'setor', 'local', 'camiseta', 'calca', 'sapato', 'ativo', 'crachaHash'],
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

// Crachá do terminal público de apontamento — código numérico impresso como
// código de barras, lido no lugar de digitar o ID do operador. Só dígitos
// (não hex) pra aproveitar a compactação do CODE128C (2 dígitos por símbolo)
// -- um hash hex de 32 caracteres virava um código de barras largo demais
// pra alguns leitores conseguirem ler. 10 dígitos aleatórios: distinto do
// comprimento de pedido (4-6) e etapa (9), e com margem de sobra contra
// colisão (10^10 combinações pra poucas centenas de crachás).
async function gerarCracha(id) {
  let codigo;
  let tentativas = 0;
  do {
    codigo = String(crypto.randomInt(0, 10 ** 10)).padStart(10, '0');
    tentativas += 1;
  } while (
    tentativas < 10 &&
    (await Usuario.findOne({ where: { crachaHash: codigo }, attributes: ['id'] }))
  );
  await Usuario.update({ crachaHash: codigo }, { where: { id: Number(id) } });
  return codigo;
}

async function buscarOperadorPorCracha(codigo) {
  if (!codigo) return null;
  const row = await Usuario.findOne({
    where: { crachaHash: String(codigo), ativo: true, local: 'FABRICA' },
    attributes: ['id', 'login'],
  });
  return row ? { id: row.id, nome: row.login } : null;
}

async function alterarSenha(p_id, p_senha) {
  const senha = String(p_senha ?? '');
  if (senha.length < 6) throw new Error('A senha deve ter ao menos 6 caracteres.');
  const senhaHash = await bcrypt.hash(senha, BCRYPT_ROUNDS);
  await Usuario.update({ senha: senhaHash }, { where: { id: Number(p_id) } });
}

module.exports = {
  buscarParaLogin,
  buscarMaiorId,
  inserirUsuario,
  listarAcessos,
  buscarAcesso,
  atualizarAcessos,
  alterarSenha,
  listarTodosUsuarios,
  atualizarUsuario,
  gerarCracha,
  buscarOperadorPorCracha,
};
