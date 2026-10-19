'use strict';
const { QueryTypes, Op } = require('sequelize');
const { sequelize, SolicitacaoCompras, SolicitacaoComprasItens, SolicitacaoInterna } = require('../client/db');

// Orçamento: lista do que precisa ser comprado, sem fornecedor definido
// ainda — serve pra levar a vários fornecedores e ver quem tem o quê,
// antes de decidir com quem comprar.
async function criarOrcamento({ observacoes, itens, usuarioId }) {
  return sequelize.transaction(async (t) => {
    const cabecalho = await SolicitacaoCompras.create({
      solicitanteId: usuarioId,
      observacoes: observacoes || null,
    }, { transaction: t });

    for (const item of itens) {
      await SolicitacaoComprasItens.create({
        solicitacaoId: cabecalho.id,
        materialId: item.materialId,
        quantidade: item.quantidade,
        fornecedorId: null,
        usuarioId,
        cancelado: false,
      }, { transaction: t });
    }

    // Qualquer solicitação interna pendente desses materiais (ferramenta,
    // EPI, limpeza etc. pedidos pela produção) acabou de entrar num
    // orçamento — deixa de aparecer como pendente em Necessidade de
    // Compra, já que a Compras está cuidando dela agora.
    const materialIds = [...new Set(itens.map((i) => i.materialId))];
    await SolicitacaoInterna.update(
      { atendidaEm: new Date() },
      {
        where: { materialId: { [Op.in]: materialIds }, cancelada: false, atendidaEm: null },
        transaction: t,
      },
    );

    return cabecalho.id;
  });
}

// Itens de orçamento ainda sem fornecedor confirmado — o que falta decidir
// de quem comprar.
async function listarItensAbertos() {
  return sequelize.query(
    `SELECT sci.id, sci.solicitacao_id, sci.material_id, sci.quantidade,
            sc.data_solicitacao, sc.observacoes,
            u.login AS solicitante_login,
            m.codigo_interno, m.descricao AS material_descricao, m.unidade_base
     FROM "tblSolicitacaoComprasItens" sci
     JOIN "tblSolicitacaoCompras" sc ON sc.id = sci.solicitacao_id
     JOIN "tblMateriais" m           ON m.id = sci.material_id
     JOIN "tblUsuario" u             ON u.id = sc.solicitante_id
     WHERE sci.fornecedor_id IS NULL AND sci.cancelado = false
     ORDER BY sc.data_solicitacao ASC, m.codigo_interno ASC`,
    { type: QueryTypes.SELECT },
  );
}

// Item ainda em orçamento (sem fornecedor) — usado por quem só pode agir
// enquanto a quantidade ainda não foi efetivada num pedido.
async function buscarItemOrcamento(itemId, t) {
  const item = await SolicitacaoComprasItens.findByPk(itemId, { transaction: t });
  if (!item || item.cancelado) {
    throw Object.assign(new Error('Item de orçamento não encontrado.'), { status: 404 });
  }
  if (item.fornecedorId) {
    throw Object.assign(new Error('Este item já foi efetivado num pedido.'), { status: 400 });
  }
  return item;
}

// Edita a quantidade de um item ainda em orçamento — só é permitido
// enquanto ele não tiver fornecedor confirmado (depois disso a
// quantidade já foi efetivada num pedido).
async function atualizarQuantidadeItem({ itemId, quantidade }) {
  return sequelize.transaction(async (t) => {
    const item = await buscarItemOrcamento(itemId, t);
    item.quantidade = quantidade;
    await item.save({ transaction: t });
    return item.id;
  });
}

// Cancela um item — de orçamento (sem fornecedor ainda) ou de pedido já
// confirmado com fornecedor (ex.: fornecedor não entregou). Só não pode
// mais cancelar depois que a nota fiscal de entrada já vinculou esse item
// (nf_item_id setado) — nesse ponto a compra já chegou de verdade.
async function cancelarItem(itemId) {
  return sequelize.transaction(async (t) => {
    const item = await SolicitacaoComprasItens.findByPk(itemId, { transaction: t });
    if (!item || item.cancelado) {
      throw Object.assign(new Error('Item não encontrado.'), { status: 404 });
    }
    if (item.nfItemId) {
      throw Object.assign(new Error('Este item já foi recebido (nota fiscal vinculada), não pode mais cancelar.'), { status: 400 });
    }
    item.cancelado = true;
    await item.save({ transaction: t });
    return item.id;
  });
}

// Confirma a compra de vários itens de orçamento de uma vez, com um único
// fornecedor: cria um novo cabeçalho — agora representando o PEDIDO, não
// mais o orçamento — e move pra ele só a quantidade efetivamente
// confirmada de cada item (os itens não precisam vir todos do mesmo
// orçamento original). O que sobrar de cada item continua em aberto, no
// orçamento de origem, pra outro fornecedor confirmar depois.
async function confirmarPedido({ fornecedorId, observacoes, itens, usuarioId }) {
  return sequelize.transaction(async (t) => {
    const pedido = await SolicitacaoCompras.create({
      solicitanteId: usuarioId,
      observacoes: observacoes || null,
    }, { transaction: t });

    const agora = new Date();

    for (const { itemId, quantidade } of itens) {
      const item = await buscarItemOrcamento(itemId, t);

      const disponivel = Number(item.quantidade);
      if (quantidade > disponivel + 0.0005) {
        throw Object.assign(
          new Error(`Quantidade maior que a disponível no item "${item.id}".`),
          { status: 400 },
        );
      }

      const restante = disponivel - quantidade;
      if (restante <= 0.0005) {
        item.solicitacaoId = pedido.id;
        item.fornecedorId = fornecedorId;
        item.dataPedido = agora;
        await item.save({ transaction: t });
      } else {
        item.quantidade = restante;
        await item.save({ transaction: t });

        await SolicitacaoComprasItens.create({
          solicitacaoId: pedido.id,
          materialId: item.materialId,
          quantidade,
          fornecedorId,
          dataPedido: agora,
          usuarioId,
          cancelado: false,
        }, { transaction: t });
      }
    }

    return pedido.id;
  });
}

// Pedido já confirmado — cabeçalho + itens, todos já com fornecedor e data
// de pedido definidos.
async function buscarPedido(id) {
  const cabecalhoRows = await sequelize.query(
    `SELECT sc.id, sc.data_solicitacao, sc.observacoes, u.login AS solicitante_login
     FROM "tblSolicitacaoCompras" sc
     JOIN "tblUsuario" u ON u.id = sc.solicitante_id
     WHERE sc.id = :id`,
    { replacements: { id }, type: QueryTypes.SELECT },
  );
  const cabecalho = cabecalhoRows[0];
  if (!cabecalho) return null;

  const itens = await sequelize.query(
    `SELECT sci.id, sci.material_id, sci.quantidade, sci.fornecedor_id, sci.data_pedido,
            m.codigo_interno, m.descricao AS material_descricao, m.unidade_base,
            f.nome AS fornecedor_nome
     FROM "tblSolicitacaoComprasItens" sci
     JOIN "tblMateriais" m         ON m.id = sci.material_id
     LEFT JOIN "tblFornecedores" f ON f.id = sci.fornecedor_id
     WHERE sci.solicitacao_id = :id
     ORDER BY m.codigo_interno ASC`,
    { replacements: { id }, type: QueryTypes.SELECT },
  );

  return { ...cabecalho, itens };
}

// Todo item que já saiu do orçamento e foi efetivado com um fornecedor —
// "em andamento" (esperando chegar), "concluído" (nota fiscal já vinculou
// esse item) ou "cancelado". Status calculado na service, aqui só traz os
// dados crus de cada item + de que pedido/orçamento ele faz parte.
async function listarPedidos() {
  return sequelize.query(
    `SELECT sci.id, sci.solicitacao_id, sci.material_id, sci.quantidade,
            sci.data_pedido, sci.cancelado, sci.nf_item_id,
            sc.data_solicitacao, sc.observacoes,
            u.login AS solicitante_login,
            m.codigo_interno, m.descricao AS material_descricao, m.unidade_base,
            f.nome AS fornecedor_nome
     FROM "tblSolicitacaoComprasItens" sci
     JOIN "tblSolicitacaoCompras" sc ON sc.id = sci.solicitacao_id
     JOIN "tblMateriais" m           ON m.id = sci.material_id
     JOIN "tblUsuario" u             ON u.id = sc.solicitante_id
     LEFT JOIN "tblFornecedores" f   ON f.id = sci.fornecedor_id
     WHERE sci.fornecedor_id IS NOT NULL
     ORDER BY sc.data_solicitacao DESC, m.codigo_interno ASC`,
    { type: QueryTypes.SELECT },
  );
}

// Itens de pedido já confirmados com este fornecedor, ainda não recebidos
// (sem nota fiscal vinculada) — candidatos pra "essa linha da NF é a
// chegada de qual pedido" na tela de lançar nota fiscal.
async function listarPedidosAbertosPorFornecedor(fornecedorId) {
  return sequelize.query(
    `SELECT sci.id, sci.material_id, sci.quantidade, sci.data_pedido, sci.solicitacao_id
     FROM "tblSolicitacaoComprasItens" sci
     WHERE sci.fornecedor_id = :fornecedorId AND sci.nf_item_id IS NULL AND sci.cancelado = false
     ORDER BY sci.data_pedido ASC`,
    { replacements: { fornecedorId: Number(fornecedorId) }, type: QueryTypes.SELECT },
  );
}

module.exports = {
  criarOrcamento,
  listarItensAbertos,
  atualizarQuantidadeItem,
  cancelarItem,
  confirmarPedido,
  buscarPedido,
  listarPedidos,
  listarPedidosAbertosPorFornecedor,
};
