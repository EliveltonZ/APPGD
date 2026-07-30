const { QueryTypes } = require('sequelize');
const {
  sequelize,
  Config, EquipSat, Montador,
  Falhas, Ocorrencia, Pecas,
  Projetos, Clientes, Liberador,
} = require('../client/db');

async function getConfig() {
  const rows = await Config.findAll({ order: [['cod', 'ASC']] });
  return rows.map(r => ({ cod: r.cod, descricao: r.descricao }));
}

async function inserirEquipeSat(p_id_sat, p_id_montador) {
  await EquipSat.create({ idSat: String(p_id_sat), idMontador: Number(p_id_montador) });
}

async function getPecas(p_id_assistencia) {
  const rows = await Pecas.findAll({
    where: { idAssistencia: String(p_id_assistencia) },
    attributes: ['codigo', 'qtd', 'peca', 'dimensoes', 'cor', 'lado', 'idOcorrencia', 'idFalha', 'observacoes'],
    include: [
      { model: Ocorrencia, as: 'ocorrencia', attributes: ['descricao'], required: true },
      { model: Falhas,     as: 'falha',      attributes: ['descricao'], required: true },
    ],
  });
  return rows.map(pk => ({
    codigo:        pk.codigo,
    qtd:           pk.qtd,
    peca:          pk.peca,
    dimensoes:     pk.dimensoes,
    cor:           pk.cor,
    lado:          pk.lado,
    id_ocorrencia: pk.idOcorrencia,
    ocorrencia:    pk.ocorrencia?.descricao ?? null,
    id_falha:      pk.idFalha,
    falha:         pk.falha?.descricao      ?? null,
    observacoes:   pk.observacoes,
  }));
}

async function listarFalhas() {
  const rows = await Falhas.findAll({ order: [['codigo', 'ASC']] });
  return rows.map(r => ({ codigo: r.codigo, descricao: r.descricao }));
}

async function listarOcorrencias() {
  const rows = await Ocorrencia.findAll();
  return rows.map(r => ({
    cod:           r.cod,
    descricao:     r.descricao,
    dias_fabrica:  r.diasFabrica,
    dias_logistica: r.diasLogistica,
  }));
}

async function listarMontadores() {
  const rows = await Montador.findAll({ order: [['id', 'ASC']] });
  return rows.map(r => ({ codigo: r.id, nome: r.name }));
}

async function buscarContratoAssistencia(p_contrato) {
  const rows = await Projetos.findAll({
    where: { contrato: Number(p_contrato) },
    attributes: [],
    include: [
      { model: Clientes,  as: 'tblCliente',   attributes: ['name'], required: true  },
      { model: Liberador, as: 'tblLiberador',  attributes: ['name'], required: false },
    ],
  });

  const seen = new Set();
  return rows
    .map(p => ({ cliente: p.tblCliente.name, liberador: p.tblLiberador?.name ?? null }))
    .filter(item => {
      const key = `${item.cliente}|${item.liberador}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

module.exports = {
  getConfig,
  inserirEquipeSat,
  getPecas,
  listarFalhas,
  listarOcorrencias,
  listarMontadores,
  buscarContratoAssistencia,
};
