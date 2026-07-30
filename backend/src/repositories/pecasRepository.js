const { Pecas, Ocorrencia, Falhas } = require('../client/db');

async function listarPecas(p_id_assistencia) {
  const rows = await Pecas.findAll({
    where: { idAssistencia: String(p_id_assistencia) },
    attributes: ['codigo', 'qtd', 'peca', 'dimensoes', 'cor', 'lado', 'idOcorrencia', 'idFalha', 'observacoes'],
    include: [
      { model: Ocorrencia, as: 'ocorrencia', attributes: ['descricao'], required: true },
      { model: Falhas,     as: 'falha',      attributes: ['descricao'], required: true },
    ],
  });
  return rows.map(pk => ({
    codigo:       pk.codigo,
    qtd:          pk.qtd,
    peca:         pk.peca,
    dimensoes:    pk.dimensoes,
    cor:          pk.cor,
    lado:         pk.lado,
    id_ocorrencia: pk.idOcorrencia,
    ocorrencia:   pk.ocorrencia?.descricao ?? null,
    id_falha:     pk.idFalha,
    falha:        pk.falha?.descricao      ?? null,
    observacoes:  pk.observacoes,
  }));
}

async function inserirPecas(p_id_assistencia, p_pecas) {
  await Pecas.bulkCreate(
    p_pecas.map(r => ({
      qtd:           Number(r.qtd) || 0,
      cor:           r.cor                        ?? null,
      peca:          r.peca                       ?? null,
      idAssistencia: String(p_id_assistencia),
      dimensoes:     r.dimensoes                  ?? null,
      lado:          r.lado                       ?? null,
      idOcorrencia:  r.id_ocorrencia ? Number(r.id_ocorrencia) : null,
      observacoes:   r.observacoes                ?? null,
      idFalha:       r.id_falha     ? Number(r.id_falha)      : null,
    }))
  );
}

module.exports = { listarPecas, inserirPecas };
