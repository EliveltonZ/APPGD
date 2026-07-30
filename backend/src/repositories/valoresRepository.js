const { Op } = require("sequelize");
const { Projetos, Clientes } = require("../client/db");

async function listarValoresProjetos(p_inicio, p_fim) {
  const rows = await Projetos.findAll({
    where: {
      dataentrega: { [Op.between]: [p_inicio, p_fim] },
    },
    attributes: [
      'ordemdecompra', 'pedido', 'contrato', 'numproj', 'ambiente',
      'valorbruto', 'valornegociado', 'chegoufabrica', 'dataentrega', 'customaterial',
    ],
    include: [
      { model: Clientes, as: 'tblCliente', attributes: ['name'], required: true },
    ],
    order: [['dataentrega', 'ASC']],
  });

  return rows.map((p) => {
    const bruto     = Number(p.valorbruto    ?? 0);
    const negociado = Number(p.valornegociado ?? 0);
    const material  = Number(p.customaterial  ?? 0);

    const desconto   = bruto > 0 && negociado > 0
      ? ((bruto - negociado) / bruto) * 100 : 0;
    const lucrobruto = negociado > 0 && material > 0
      ? negociado - material : 0;
    const margem     = negociado > 0 && material > 0
      ? ((negociado - material) / negociado) * 100 : 0;

    return {
      ordemdecompra:  p.ordemdecompra,
      pedido:         p.pedido,
      contrato:       p.contrato,
      cliente:        p.tblCliente?.name ?? null,
      numproj:        p.numproj,
      ambiente:       p.ambiente,
      valorbruto:     bruto,
      valornegociado: negociado,
      chegoufabrica:  p.chegoufabrica,
      dataentrega:    p.dataentrega,
      customaterial:  material,
      desconto,
      lucrobruto,
      margem,
    };
  });
}

module.exports = { listarValoresProjetos };
