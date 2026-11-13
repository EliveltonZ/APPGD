const { Op } = require("sequelize");
const { Acessorios, Projetos, Clientes } = require("../client/db");
const { compraStatus } = require("../utils/calcStatus");

async function listarAcessoriosCompras({ dataentrega } = {}) {
  const cutoff = dataentrega || '1970-01-01';

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
      categoria:    dados.categoria    ?? null,
      descricao:    dados.descricao    ?? null,
      medida:       dados.medida       ?? null,
      parcelamento: dados.parcelamento ?? null,
      numcard:      dados.numcard      ?? null,
      qtd:          dados.qtd          ?? null,
      fornecedor:   dados.fornecedor   ?? null,
      datacompra:   dados.datacompra   ?? null,
      previsao:     dados.previsao     ?? null,
      recebido:     dados.recebido     ?? null,
    },
    { where: { id: dados.id } },
  );
}

module.exports = { listarAcessoriosCompras, atualizarAcessorios };
