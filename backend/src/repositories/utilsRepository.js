const { Op, QueryTypes } = require('sequelize');
const T = require('../config/tables');
const {
  sequelize,
  Projetos, Liberador, TipoAmbiente, Vendedor, Loja,
  Etapa, TipoContrato, TipoCliente, TipoAssistencia, Categorias,
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

async function getDado(id) {
  const row = await Datas.findByPk(Number(id));
  return row ? [{ data: row.data }] : [];
}

async function setDado({ id, date }) {
  await Datas.update({ data: date || null }, { where: { id: Number(id) } });
}

async function listarOperadores() {
  const rows = await Usuario.findAll({
    where: { ativo: true, local: 'FABRICA' },
    order: [['login', 'ASC']],
  });
  return rows.map(r => ({ id: r.id, nome: r.login }));
}

async function listarTipoCliente() {
  const rows = await TipoCliente.findAll({ order: [['name', 'ASC']] });
  return rows.map(r => ({ id: r.id, tipo_cliente: r.name }));
}

async function listarTiposAssistencia() {
  const rows = await TipoAssistencia.findAll({ order: [['id', 'ASC']] });
  return rows.map(r => ({ id: r.id, name: r.name }));
}

// ─── Convertidos de raw SQL ───────────────────────────────────────────────────

async function listarCausaFalha(idFalha) {
  const rows = await CausaFalha.findAll({
    where: { idFalha: Number(idFalha) },
    attributes: ['idCausa'],
    include: [{ model: Causa, as: 'causa', attributes: ['descricao'] }],
    order: [[{ model: Causa, as: 'causa' }, 'descricao', 'ASC']],
  });
  return rows.map(r => ({ id: r.idCausa, descricao: r.causa?.descricao ?? null }));
}

async function buscarUsuario(id) {
  const row = await Usuario.findByPk(Number(id), { attributes: ['login', 'ativo'] });
  return row ? [{ nome: row.login, ativo: row.ativo }] : [];
}

async function getAcessorios(ordemdecompra) {
  return Acessorios.findAll({
    where: { ordemdecompra: Number(ordemdecompra) },
    attributes: ['id', 'categoria', 'descricao', 'medida', 'qtd', 'datacompra', 'previsao', 'recebido'],
    order: [['id', 'ASC']],
    raw: true,
  });
}

async function buscarData(id) {
  const row = await Datas.findByPk(Number(id), { attributes: ['data', 'email'] });
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

async function setEtapa(pedido, codigo) {
  const campo = ETAPA_MAP[Number(codigo)];
  if (!campo) return null;

  const projeto = await Projetos.findOne({
    where: { pedido: Number(pedido) },
    attributes: ['ordemdecompra'],
  });
  if (!projeto) return null;

  await Producao.update(
    { [campo]: fmtDate() },
    { where: { ordemdecompra: projeto.ordemdecompra } }
  );
  return `Campo "${campo}" atualizado para ordemdecompra "${projeto.ordemdecompra}".`;
}

async function getProjetoCodigoBarras(pedido) {
  return Projetos.findAll({
    where: { pedido: Number(pedido) },
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
async function validateLogin(codigo, senha) {
  return sequelize.query(
    `SELECT codigo, nome FROM "${T.montador.name}" WHERE codigo = :codigo AND senha = :senha`,
    { replacements: { codigo, senha }, type: QueryTypes.SELECT }
  );
}

// Mantido em raw SQL: tblPecas não tem as colunas `id_montador`, `cliente`, `ambiente`
// no modelo Sequelize
async function getSolicitacoes(idMontador) {
  return sequelize.query(
    `SELECT codigo, qtd, cor, peca, dimensoes, cliente, ambiente
     FROM "${T.pecas.name}"
     WHERE id_montador = :id_montador AND id_assistencia IS NULL`,
    { replacements: { id_montador: Number(idMontador) }, type: QueryTypes.SELECT }
  );
}

// Mantido em raw SQL: tblPecas não tem `cliente` e `ambiente` no modelo
async function totalPecas() {
  return sequelize.query(
    `SELECT codigo, qtd, cor, peca, dimensoes, lado, cliente, ambiente,
            (SELECT descricao FROM "${T.ocorrencia.name}" WHERE cod = id_ocorrencia) AS tipo
     FROM "${T.pecas.name}"
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

async function setTipo(ordemdecompra, tipo, urgente) {
  await Projetos.update(
    {
      tipo:    tipo    ?? null,
      urgente: urgente === true || urgente === 'true',
    },
    { where: { ordemdecompra: Number(ordemdecompra) } }
  );
}

async function listarEquipSat(idSat) {
  const rows = await EquipSat.findAll({
    where: { idSat: String(idSat) },
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
  listarTiposAssistencia,
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
