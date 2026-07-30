const { Op } = require("sequelize");
const { Acessorios, Projetos, Clientes } = require("../client/db");
const { compraStatus } = require("../utils/calcStatus");

async function listarAcessoriosCompras({ p_dataentrega } = {}) {
  const cutoff = p_dataentrega || '1970-01-01';

  const rows = await Acessorios.findAll({
    attributes: [
      'id', 'ordemdecompra', 'descricao', 'categoria', 'medida', 'qtd',
      'parcelamento', 'numcard', 'fornecedor', 'datacompra', 'previsao', 'recebido',
    ],
    include: [{
      model: Projetos,
      as: 'ordemdecompraTblProjeto',
      required: true,
      where: { dataentrega: { [Op.gt]: cutoff } },
      attributes: ['contrato', 'cliente', 'ambiente', 'chegoufabrica', 'dataentrega', 'pendencia'],
      include: [{
        model: Clientes,
        as: 'tblCliente',
        required: false,
        attributes: ['name'],
      }],
    }],
  });

  return rows
    .sort((a, b) => {
      const pa = a.ordemdecompraTblProjeto;
      const pb = b.ordemdecompraTblProjeto;
      const da = pa.dataentrega || '';
      const db = pb.dataentrega || '';
      if (da !== db) return da < db ? -1 : 1;
      const ca = pa.tblCliente?.name || pa.cliente || '';
      const cb = pb.tblCliente?.name || pb.cliente || '';
      if (ca !== cb) return ca < cb ? -1 : 1;
      if (pa.ambiente !== pb.ambiente) return (pa.ambiente || '') < (pb.ambiente || '') ? -1 : 1;
      if (a.categoria !== b.categoria) return (a.categoria || '') < (b.categoria || '') ? -1 : 1;
      return (a.descricao || '') < (b.descricao || '') ? -1 : 1;
    })
    .map((a) => {
      const p = a.ordemdecompraTblProjeto;
      return {
        id:            a.id,
        ordemdecompra: a.ordemdecompra,
        descricao:     a.descricao,
        categoria:     a.categoria,
        medida:        a.medida,
        qtd:           a.qtd,
        parcelamento:  a.parcelamento,
        numcard:       a.numcard,
        fornecedor:    a.fornecedor,
        datacompra:    a.datacompra,
        previsao:      a.previsao,
        recebido:      a.recebido,
        contrato:      p.contrato,
        cliente:       p.tblCliente?.name ?? p.cliente ?? '',
        ambiente:      p.ambiente,
        chegoufabrica: p.chegoufabrica,
        dataentrega:   p.dataentrega,
        status:        compraStatus({ recebido: a.recebido, pendencia: p.pendencia, dataentrega: p.dataentrega }),
      };
    });
}

async function atualizarAcessorios(dados) {
  await Acessorios.update(
    {
      categoria:    dados.p_categoria    ?? null,
      descricao:    dados.p_descricao    ?? null,
      medida:       dados.p_medida       ?? null,
      parcelamento: dados.p_parcelamento ?? null,
      numcard:      dados.p_numcard      ?? null,
      qtd:          dados.p_qtd          ?? null,
      fornecedor:   dados.p_fornecedor   ?? null,
      datacompra:   dados.p_datacompra   ?? null,
      previsao:     dados.p_previsao     ?? null,
      recebido:     dados.p_recebido     ?? null,
    },
    { where: { id: dados.p_id } },
  );
}

module.exports = { listarAcessoriosCompras, atualizarAcessorios };
