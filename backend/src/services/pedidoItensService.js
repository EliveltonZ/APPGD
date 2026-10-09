'use strict';
const repo = require('../repositories/estoqueRepository');

function erro(mensagem, status, code) {
  return Object.assign(new Error(mensagem), { status, code });
}

const TIPO_POR_UNIDADE = { M2: 'CHAPA', M: 'FITA', UN: 'FERRAGEM' };

async function buscarPorContrato(contrato) {
  if (!contrato) throw erro('Informe um contrato.', 400, 'VALIDACAO');
  return repo.buscarContratoPedido(contrato);
}

async function listarItens(ordemdecompra) {
  const rows = await repo.listarXmlConsumoPorPedido(ordemdecompra);
  if (!rows.length) return [];

  const materiaisIds = [...new Set(rows.map(r => r.materialId))];
  const materiais = await repo.buscarMateriaisPorId(materiaisIds);
  const porId = new Map(materiais.map(m => [m.id, m]));

  return rows.map(r => {
    const m = porId.get(r.materialId);
    return {
      id:            r.id,
      materialId:    r.materialId,
      codigoInterno: m?.codigoInterno ?? null,
      descricao:     m?.descricao ?? null,
      unidade:       r.unidadeXml,
      tipo:          TIPO_POR_UNIDADE[r.unidadeXml] ?? 'FERRAGEM',
      quantidade:    r.qtdXml != null ? Number(r.qtdXml) : null,
      detalhes:      r.detalhes,
      origem:        r.importacaoId == null ? 'MANUAL' : 'XML',
      status:        r.status,
    };
  });
}

// Lança um item direto no pedido, sem precisar de uma importação de XML —
// é o que o liberador usa pra registrar um acessório de terceiro (porta,
// vidro, espelho) no momento da liberação, antes do XML sequer existir.
async function adicionarManual({ ordemdecompra, materialId, quantidade, detalhes }) {
  if (!ordemdecompra) throw erro('Informe o pedido.', 400, 'VALIDACAO');
  if (!materialId) throw erro('Escolha um material.', 400, 'VALIDACAO');
  if (!quantidade || quantidade <= 0) throw erro('Informe uma quantidade válida.', 400, 'VALIDACAO');

  const material = await repo.buscarMaterial(materialId);
  if (!material) throw erro('Material não encontrado.', 404, 'VALIDACAO');

  const unidade = material.unidadeBase;
  // Ferragem (UN) já nasce com a quantidade confirmada — não precisa do
  // passo de "informar quantas UN" que chapa/fita exigem.
  const qtdUn = unidade === 'UN' ? quantidade : null;

  return repo.criarConsumoManual({
    importacaoId:    null,
    ordemdecompra,
    materialId,
    qtdXml:          quantidade,
    unidadeXml:      unidade,
    qtdUnSugerida:   qtdUn,
    qtdUnConfirmada: qtdUn,
    detalhes:        detalhes || null,
    status:          'PENDENTE',
  });
}

async function remover(id) {
  return repo.removerConsumoManual(id);
}

module.exports = { buscarPorContrato, listarItens, adicionarManual, remover };
