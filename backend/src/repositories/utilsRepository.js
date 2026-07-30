const { Op, QueryTypes } = require('sequelize');
const {
  sequelize,
  Projetos, Liberador, TipoAmbiente, Vendedor, Loja,
  Etapa, TipoContrato, TipoCliente, Categorias,
  Datas, Usuario, CausaFalha, Causa,
  Montador, EquipSat, Acessorios,
  Falhas, Ocorrencia, Producao,
} = require('../client/db');

function fmtDate(d = new Date()) {
  return new Date(d)
    .toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' })
    .replace(',', '');
}

// ─── Lookups já convertidos (inalterados) ────────────────────────────────────

async function listarLiberadores() {
  const rows = await Liberador.findAll({ order: [['name', 'ASC']] });
  return rows.map(r => ({ id: r.id, liberador: r.name }));
}

async function listarAmbientes() {
  const rows = await TipoAmbiente.findAll({ order: [['name', 'ASC']] });
  return rows.map(r => ({ id: r.id, tipo_ambiente: r.name }));
}

async function listarVendedores() {
  const rows = await Vendedor.findAll({ order: [['name', 'ASC']] });
  return rows.map(r => ({ id: r.id, vendedor: r.name }));
}

async function listarLojas() {
  const rows = await Loja.findAll({ order: [['name', 'ASC']] });
  return rows.map(r => ({ id: r.id, loja: r.name }));
}

async function listarEtapas() {
  const rows = await Etapa.findAll({ order: [['id', 'ASC']] });
  return rows.map(r => ({ id: r.id, etapa: r.name }));
}

async function listarTipoContrato() {
  const rows = await TipoContrato.findAll({ order: [['name', 'ASC']] });
  return rows.map(r => ({ id: r.id, tipocontrato: r.name }));
}

async function listarCategorias() {
  const rows = await Categorias.findAll({ order: [['name', 'ASC']] });
  return rows.map(r => ({ id: r.id, categoria: r.name }));
}

async function maxOrder() {
  const max = await Projetos.max('ordemdecompra', {
    where: { ordemdecompra: { [Op.lt]: 2000000000 } },
  });
  return [{ max: max ?? 0 }];
}

async function getDado(p_id) {
  const row = await Datas.findByPk(Number(p_id));
  return row ? [{ data: row.data }] : [];
}

async function setDado({ p_id, p_date }) {
  await Datas.update({ data: p_date || null }, { where: { id: Number(p_id) } });
}

async function listarOperadores() {
  const rows = await Usuario.findAll({
    where: { ativo: true },
    order: [['login', 'ASC']],
  });
  return rows.map(r => ({ id: r.id, nome: r.login }));
}

async function listarTipoCliente() {
  const rows = await TipoCliente.findAll({ order: [['name', 'ASC']] });
  return rows.map(r => ({ id: r.id, tipo_cliente: r.name }));
}

// ─── Convertidos de raw SQL ───────────────────────────────────────────────────

async function listarCausaFalha(p_id_falha) {
  const rows = await CausaFalha.findAll({
    where: { idFalha: Number(p_id_falha) },
    attributes: ['id'],
    include: [{ model: Causa, as: 'causa', attributes: ['descricao'] }],
    order: [[{ model: Causa, as: 'causa' }, 'descricao', 'ASC']],
  });
  return rows.map(r => ({ id: r.id, descricao: r.causa?.descricao ?? null }));
}

async function buscarUsuario(p_id) {
  const row = await Usuario.findByPk(Number(p_id), { attributes: ['login', 'ativo'] });
  return row ? [{ nome: row.login, ativo: row.ativo }] : [];
}

async function getAcessorios(p_ordemdecompra) {
  return Acessorios.findAll({
    where: { ordemdecompra: Number(p_ordemdecompra) },
    attributes: ['id', 'categoria', 'descricao', 'medida', 'qtd', 'datacompra', 'previsao', 'recebido'],
    order: [['id', 'ASC']],
    raw: true,
  });
}

async function buscarData(p_id) {
  const row = await Datas.findByPk(Number(p_id), { attributes: ['data', 'email'] });
  return row ? [{ data: row.data, email: row.email }] : [];
}

const ETAPA_MAP = {
  21: 'corteinicio',       22: 'cortefim',
  31: 'customizacaoinicio', 32: 'customizacaofim',
  41: 'coladeirainicio',   42: 'coladeirafim',
  51: 'usinageminicio',    52: 'usinagemfim',
  61: 'montageminicio',    62: 'montagemfim',
  71: 'paineisinicio',     72: 'paineisfim',
  81: 'embalageminicio',   82: 'embalagemfim',
};

async function setEtapa(p_pedido, p_codigo) {
  const campo = ETAPA_MAP[Number(p_codigo)];
  if (!campo) return null;

  const projeto = await Projetos.findOne({
    where: { pedido: Number(p_pedido) },
    attributes: ['ordemdecompra'],
  });
  if (!projeto) return null;

  await Producao.update(
    { [campo]: fmtDate() },
    { where: { ordemdecompra: projeto.ordemdecompra } }
  );
  return `Campo "${campo}" atualizado para ordemdecompra "${projeto.ordemdecompra}".`;
}

async function getProjetoCodigoBarras(p_pedido) {
  return Projetos.findAll({
    where: { pedido: Number(p_pedido) },
    attributes: ['contrato', 'cliente', 'ambiente'],
    raw: true,
  });
}

async function getMontadores() {
  const rows = await Montador.findAll({ order: [['id', 'ASC']] });
  return rows.map(r => ({ codigo: r.id, nome: r.name }));
}

// Mantido em raw SQL: a tabela tblMontador tem colunas `codigo` e `senha`
// que não estão definidas no modelo Sequelize
async function validateLogin(p_codigo, p_senha) {
  return sequelize.query(
    `SELECT codigo, nome FROM "tblMontador" WHERE codigo = :codigo AND senha = :senha`,
    { replacements: { codigo: p_codigo, senha: p_senha }, type: QueryTypes.SELECT }
  );
}

// Mantido em raw SQL: tblPecas não tem as colunas `id_montador`, `cliente`, `ambiente`
// no modelo Sequelize
async function getSolicitacoes(p_id_montador) {
  return sequelize.query(
    `SELECT codigo, qtd, cor, peca, dimensoes, cliente, ambiente
     FROM "tblPecas"
     WHERE id_montador = :id_montador AND id_assistencia IS NULL`,
    { replacements: { id_montador: Number(p_id_montador) }, type: QueryTypes.SELECT }
  );
}

// Mantido em raw SQL: tblPecas não tem `cliente` e `ambiente` no modelo
async function totalPecas() {
  return sequelize.query(
    `SELECT codigo, qtd, cor, peca, dimensoes, lado, cliente, ambiente,
            (SELECT descricao FROM "tblOcorrencia" WHERE cod = id_ocorrencia) AS tipo
     FROM "tblPecas"
     WHERE id_assistencia IS NULL`,
    { type: QueryTypes.SELECT }
  );
}

async function getOcorrencias() {
  const rows = await Ocorrencia.findAll();
  return rows.map(r => ({
    cod:           r.cod,
    descricao:     r.descricao,
    dias_fabrica:  r.diasFabrica,
    dias_logistica: r.diasLogistica,
  }));
}

async function getFalhas() {
  const rows = await Falhas.findAll({ order: [['codigo', 'ASC']] });
  return rows.map(r => ({ codigo: r.codigo, descricao: r.descricao }));
}

async function setTipo(p_ordemdecompra, p_tipo, p_urgente) {
  await Projetos.update(
    {
      tipo:    p_tipo    ?? null,
      urgente: p_urgente === true || p_urgente === 'true',
    },
    { where: { ordemdecompra: Number(p_ordemdecompra) } }
  );
}

async function listarEquipSat(p_id_sat) {
  const rows = await EquipSat.findAll({
    where: { idSat: String(p_id_sat) },
    attributes: ['idMontador'],
    include: [{ model: Montador, as: 'montador', attributes: ['name'] }],
  });
  return rows.map(r => ({ id: r.idMontador, name: r.montador?.name ?? null }));
}

module.exports = {
  listarLiberadores,
  listarAmbientes,
  listarVendedores,
  listarLojas,
  listarEtapas,
  listarTipoContrato,
  listarTipoCliente,
  listarCategorias,
  maxOrder,
  getDado,
  setDado,
  listarOperadores,
  listarCausaFalha,
  buscarUsuario,
  getAcessorios,
  buscarData,
  setEtapa,
  getProjetoCodigoBarras,
  getMontadores,
  validateLogin,
  getSolicitacoes,
  totalPecas,
  getOcorrencias,
  getFalhas,
  setTipo,
  listarEquipSat,
};
