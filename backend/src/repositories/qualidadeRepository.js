const { Op } = require('sequelize');
const { Pecas, Assistencias } = require('../client/db');

async function listarPecasQualidade() {
  const rows = await Pecas.findAll({
    where: {
      [Op.or]: [{ idCausa: null }, { idCausa: 0 }],
    },
    attributes: [
      'codigo', 'idErp', 'idAssistencia', 'qtd', 'cor', 'peca',
      'dimensoes', 'lado', 'idOcorrencia', 'idFalha', 'idCausa',
      'observacoes', 'analise',
    ],
    include: [{
      model: Assistencias,
      as: 'assistencia',
      required: true,
      where: { cobrada: false },
      attributes: ['pedido', 'cliente', 'ambiente', 'cobrada', 'supervisor'],
    }],
    order: [['codigo', 'ASC']],
  });

  return rows.map(pk => ({
    id:             pk.codigo,
    pedido:         pk.assistencia.pedido,
    id_erp:         pk.idErp,
    id_assistencia: pk.idAssistencia,
    qtd:            pk.qtd,
    cor:            pk.cor,
    peca:           pk.peca,
    dimensoes:      pk.dimensoes,
    orientacao:     pk.lado,
    cliente:        pk.assistencia.cliente,
    ambiente:       pk.assistencia.ambiente,
    ocorrencia:     pk.idOcorrencia,
    falha:          pk.idFalha,
    causa:          pk.idCausa,
    cobrada:        pk.assistencia.cobrada,
    observacoes:    pk.observacoes,
    supervisor:     pk.assistencia.supervisor,
    analise:        pk.analise,
  }));
}

async function updateCausaRaiz({ id, id_erp, falha, causa, analise }) {
  await Pecas.update(
    {
      idFalha: falha  != null ? Number(falha)  : null,
      idCausa: causa  != null ? Number(causa)  : null,
      analise: analise ?? null,
      idErp:   id_erp != null ? Number(id_erp) : null,
    },
    { where: { codigo: Number(id) } },
  );
}

module.exports = { listarPecasQualidade, updateCausaRaiz };
