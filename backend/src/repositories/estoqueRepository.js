'use strict';
const { Op, QueryTypes } = require('sequelize');
const {
  sequelize, Materiais, XmlConsumo, XmlImportacoes,
  EstoqueMovimentos, SolicitacaoComprasItens, Projetos, MateriaisCodigoNF,
  Clientes,
} = require('../client/db');

async function buscarMaterial(id) {
  return Materiais.findByPk(id, { raw: true });
}

async function saldoFisico(materialId) {
  const total = await EstoqueMovimentos.sum('qtdUn', { where: { materialId } });
  return Number(total) || 0;
}

async function saldoReservado(materialId) {
  const total = await XmlConsumo.sum('qtdUnConfirmada', {
    where: { materialId, status: 'RESERVADO' },
  });
  return Number(total) || 0;
}

// "Comprado" = já tem pedido confirmado com um fornecedor (fornecedorId
// setado na confirmação de compra), mas ainda não chegou fisicamente (sem
// nf_item_id vinculado). Conta a favor do saldo porque já está garantido,
// mesmo não estando no estoque físico ainda.
async function saldoComprado(materialId) {
  const total = await SolicitacaoComprasItens.sum('quantidade', {
    where: {
      materialId, cancelado: false,
      fornecedorId: { [Op.ne]: null },
      nfItemId: null,
    },
  });
  return Number(total) || 0;
}

// "Solicitado" = ainda em orçamento, sem fornecedor confirmado — não conta
// a favor do saldo (pode não vingar com nenhum fornecedor), só informa que
// já tem compra em andamento.
async function saldoSolicitado(materialId) {
  const total = await SolicitacaoComprasItens.sum('quantidade', {
    where: { materialId, cancelado: false, fornecedorId: null },
  });
  return Number(total) || 0;
}

// Preço (e fornecedor da compra) vigente na data informada — última nota
// fiscal com data_entrada <= data. O fornecedor importa pra materiais tipo M
// (fita): o comprimento do rolo varia por fornecedor.
async function buscarPrecoNaData(materialId, data) {
  if (!data) return null;
  const rows = await sequelize.query(
    `SELECT nfi.preco_un, nf.fornecedor_id
     FROM "tblNotasFiscaisItens" nfi
     JOIN "tblNotasFiscais" nf ON nf.id = nfi.nota_fiscal_id
     WHERE nfi.material_id = :materialId AND nf.data_entrada <= :data
     ORDER BY nf.data_entrada DESC
     LIMIT 1`,
    { replacements: { materialId, data }, type: QueryTypes.SELECT },
  );
  if (!rows[0]) return null;
  return { preco: rows[0].preco_un, fornecedorId: rows[0].fornecedor_id };
}

// Fator de conversão (quantidade física por UN de compra) específico do
// fornecedor — ex.: um rolo de fita pode ter 20m com um fornecedor e 300m
// com outro. Sem isso cadastrado, não há como converter com segurança.
async function buscarFatorConversaoFornecedor(materialId, fornecedorId) {
  if (!fornecedorId) return null;
  const row = await MateriaisCodigoNF.findOne({
    where: { materialId, fornecedorId }, raw: true,
  });
  return row?.m2PorUnidade ?? null;
}

async function buscarChegouFabrica(ordemdecompra) {
  const projeto = await Projetos.findOne({
    where: { ordemdecompra }, attributes: ['chegoufabrica'], raw: true,
  });
  return projeto?.chegoufabrica ?? null;
}

async function buscarXmlConsumo(id) {
  return XmlConsumo.findByPk(id);
}

async function listarXmlConsumoPorPedido(ordemdecompra) {
  return XmlConsumo.findAll({ where: { ordemdecompra }, order: [['id', 'ASC']] });
}

// Todo item PENDENTE de um pedido — inclui quem ainda não tem a quantidade
// em UN definida, de propósito: a reserva em massa precisa enxergar quem
// falta resolver pra travar o lote inteiro, não só pular quem não está
// pronto.
async function listarPendentesDoPedido(ordemdecompra) {
  return XmlConsumo.findAll({
    where: { ordemdecompra, status: 'PENDENTE' },
    order: [['id', 'ASC']],
  });
}

async function buscarLote(ordemdecompra) {
  const p = await Projetos.findOne({ where: { ordemdecompra }, attributes: ['lote'], raw: true });
  return p?.lote ?? null;
}

async function listarOrdensDoLote(lote) {
  const rows = await Projetos.findAll({ where: { lote }, attributes: ['ordemdecompra'], raw: true });
  return rows.map(r => r.ordemdecompra);
}

async function listarPendentesOuReservados(materialId) {
  return XmlConsumo.findAll({
    where: { materialId, status: { [Op.in]: ['PENDENTE', 'RESERVADO'] } },
    order: [['dataImportacao', 'ASC']],
  });
}

async function criarMovimento(dados, options) {
  return EstoqueMovimentos.create(dados, options);
}

// Mesma regra já usada em notaFiscalRepository.criar() pro preço vindo de
// NF: só atualiza o "último preço" do material se a data desta atualização
// for >= a data já registrada — uma nota fiscal real posterior sempre
// pode sobrescrever um valor estimado de inventário, nunca o contrário
// numa ordem fora de sequência.
async function atualizarPrecoSeMaisNovo(materialId, precoUn, data) {
  const material = await Materiais.findByPk(materialId);
  if (!material) return;
  const dataAtual = material.dataUltimoPreco;
  if (!dataAtual || new Date(data) >= new Date(dataAtual)) {
    material.ultimoPrecoUn = precoUn;
    material.dataUltimoPreco = data;
    await material.save();
  }
}

async function buscarMateriaisPorId(ids) {
  return Materiais.findAll({ where: { id: { [Op.in]: ids } }, raw: true });
}

async function criarImportacao(dados) {
  return XmlImportacoes.create(dados);
}

async function criarConsumos(rows) {
  return XmlConsumo.bulkCreate(rows);
}

// Busca pedidos por contrato com a contagem de itens já lançados em
// tblXmlConsumo (XML ou manual) — usado pela tela "Itens Pedido".
async function buscarContratoPedido(contrato) {
  const rows = await Projetos.findAll({
    where: { contrato: Number(contrato) },
    attributes: ['ordemdecompra', 'ambiente', 'dataentrega', 'lote'],
    include: [{ model: Clientes, as: 'tblCliente', attributes: ['name'], required: true }],
  });
  if (!rows.length) return [];

  const ordemIds = rows.map(p => p.ordemdecompra);
  const counts = await XmlConsumo.findAll({
    where: { ordemdecompra: { [Op.in]: ordemIds } },
    attributes: ['ordemdecompra', [sequelize.fn('COUNT', sequelize.col('id')), 'total']],
    group: ['ordemdecompra'],
    raw: true,
  });
  const totalMap = new Map(counts.map(c => [String(c.ordemdecompra), Number(c.total)]));

  return rows.map(p => ({
    ordemdecompra: p.ordemdecompra,
    cliente:       p.tblCliente?.name ?? null,
    ambiente:      p.ambiente,
    dataentrega:   p.dataentrega,
    lote:          p.lote || null, // 0/null = sem lote de verdade definido
    total:         totalMap.get(String(p.ordemdecompra)) ?? 0,
  }));
}

// Item lançado direto no pedido (sem passar por importação de XML) — o
// liberador registrando um acessório de terceiro, por exemplo.
async function criarConsumoManual(dados) {
  return XmlConsumo.create(dados);
}

// Só remove item que nunca passou por importação real (importacaoId null) E
// ainda está PENDENTE — depois de reservado/baixado, excluir por aqui
// apagaria o rastro sem desfazer reserva/movimento.
async function removerConsumoManual(id) {
  const n = await XmlConsumo.destroy({ where: { id: Number(id), importacaoId: null, status: 'PENDENTE' } });
  return n > 0;
}

async function listarAbaixoDoMinimo() {
  const rows = await sequelize.query(
    `SELECT m.id, m.codigo_interno, m.descricao, m.unidade_base, m.estoque_minimo_un,
            COALESCE((SELECT SUM(qtd_un) FROM "tblEstoqueMovimentos" WHERE material_id = m.id), 0) AS fisico,
            COALESCE((SELECT SUM(qtd_un_confirmada) FROM "tblXmlConsumo" WHERE material_id = m.id AND status = 'RESERVADO'), 0) AS reservado,
            COALESCE((SELECT SUM(quantidade) FROM "tblSolicitacaoComprasItens" WHERE material_id = m.id AND cancelado = false AND fornecedor_id IS NOT NULL AND nf_item_id IS NULL), 0) AS comprado,
            EXISTS (
              SELECT 1 FROM "tblXmlConsumo" xc
              JOIN "tblProjetos" p ON p.ordemdecompra = xc.ordemdecompra
              WHERE xc.material_id = m.id AND xc.status IN ('PENDENTE', 'RESERVADO') AND p.urgente = true
            ) AS tem_pedido_urgente
     FROM "tblMateriais" m
     WHERE m.ativo = true AND m.estoque_minimo_un IS NOT NULL AND m.estoque_minimo_un > 0`,
    { type: QueryTypes.SELECT },
  );
  return rows
    .map(r => ({
      id: r.id,
      codigoInterno: r.codigo_interno,
      descricao: r.descricao,
      unidadeBase: r.unidade_base,
      estoqueMinimoUn: Number(r.estoque_minimo_un),
      fisico: Number(r.fisico),
      reservado: Number(r.reservado),
      comprado: Number(r.comprado),
      saldoBloqueio: Number(r.fisico) - Number(r.reservado) + Number(r.comprado),
      temPedidoUrgente: !!r.tem_pedido_urgente,
    }))
    .filter(r => r.saldoBloqueio <= r.estoqueMinimoUn)
    .sort((a, b) => Number(b.temPedidoUrgente) - Number(a.temPedidoUrgente));
}

// Materiais pedidos por algum projeto (item de XML ainda PENDENTE/RESERVADO,
// ou seja, que ainda vai precisar ser baixado) mas que não têm NENHUM saldo
// físico em NENHUMA localização — compras precisa comprar antes de alguém
// conseguir reservar/dar baixa nesse material. Agrupado por material, com a
// lista de pedidos/ambientes que estão esperando por ele.
async function listarSemEstoqueParaPedidos() {
  const rows = await sequelize.query(
    `SELECT xc.material_id, xc.ordemdecompra, xc.qtd_un_confirmada, xc.unidade_xml, xc.qtd_xml,
            m.codigo_interno, m.descricao, m.unidade_base,
            p.contrato, p.ambiente, p.urgente, c.name AS cliente,
            COALESCE((SELECT SUM(quantidade) FROM "tblSolicitacaoComprasItens" WHERE material_id = m.id AND cancelado = false AND fornecedor_id IS NOT NULL AND nf_item_id IS NULL), 0) AS comprado
     FROM "tblXmlConsumo" xc
     JOIN "tblMateriais" m ON m.id = xc.material_id
     JOIN "tblProjetos" p  ON p.ordemdecompra = xc.ordemdecompra
     LEFT JOIN "tblClientes" c ON c.id = p.id_cliente
     WHERE xc.status IN ('PENDENTE', 'RESERVADO')
       AND COALESCE((SELECT SUM(qtd_un) FROM "tblEstoqueMovimentos" WHERE material_id = m.id), 0) <= 0
     ORDER BY m.codigo_interno, p.contrato`,
    { type: QueryTypes.SELECT },
  );

  const porMaterial = new Map();
  for (const r of rows) {
    let grupo = porMaterial.get(r.material_id);
    if (!grupo) {
      grupo = {
        id: r.material_id,
        codigoInterno: r.codigo_interno,
        descricao: r.descricao,
        unidadeBase: r.unidade_base,
        comprado: Number(r.comprado),
        pedidos: [],
      };
      porMaterial.set(r.material_id, grupo);
    }
    grupo.pedidos.push({
      ordemdecompra: r.ordemdecompra,
      contrato: r.contrato,
      ambiente: r.ambiente,
      cliente: r.cliente,
      urgente: !!r.urgente,
      quantidade: r.qtd_un_confirmada != null ? Number(r.qtd_un_confirmada) : Number(r.qtd_xml),
      unidade: r.qtd_un_confirmada != null ? 'UN' : r.unidade_xml,
    });
  }

  // Material com pedido urgente primeiro — prioridade de compra fica óbvia
  // sem precisar abrir cada grupo pra conferir.
  return Array.from(porMaterial.values())
    .map((grupo) => ({ ...grupo, temUrgente: grupo.pedidos.some((p) => p.urgente) }))
    .sort((a, b) => Number(b.temUrgente) - Number(a.temUrgente));
}

// Saldo real por material — "o que eu realmente tenho em estoque", não fila
// de ação. Mesma fórmula de calcularSaldo() (estoqueService.js), mas numa
// query só pra todo material ativo de uma vez, em vez de N chamadas.
async function listarSaldoPorMaterial() {
  const rows = await sequelize.query(
    `SELECT m.id, m.codigo_interno, m.descricao, m.unidade_base, m.estoque_minimo_un,
            COALESCE((SELECT SUM(qtd_un) FROM "tblEstoqueMovimentos" WHERE material_id = m.id), 0) AS fisico,
            COALESCE((SELECT SUM(qtd_un_confirmada) FROM "tblXmlConsumo" WHERE material_id = m.id AND status = 'RESERVADO'), 0) AS reservado,
            COALESCE((SELECT SUM(quantidade) FROM "tblSolicitacaoComprasItens" WHERE material_id = m.id AND cancelado = false AND fornecedor_id IS NOT NULL AND nf_item_id IS NULL), 0) AS comprado,
            COALESCE((SELECT SUM(quantidade) FROM "tblSolicitacaoComprasItens" WHERE material_id = m.id AND cancelado = false AND fornecedor_id IS NULL), 0) AS solicitado
     FROM "tblMateriais" m
     WHERE m.ativo = true
     ORDER BY m.codigo_interno ASC`,
    { type: QueryTypes.SELECT },
  );
  return rows;
}

// Fila de baixa do almoxarifado: todo item já RESERVADO (qualquer material)
// + todo item PENDENTE de material sem estoque mínimo controlado (pula a
// reserva por regra — ver estoqueService.darBaixa). Cruza pedido/cliente
// pra dar contexto de qual OC/ambiente cada linha pertence.
async function listarProntosParaBaixa() {
  return sequelize.query(
    `SELECT xc.id, xc.ordemdecompra, xc.material_id, xc.qtd_xml, xc.unidade_xml,
            xc.qtd_un_confirmada, xc.detalhes, xc.status, xc.importacao_id,
            m.codigo_interno, m.descricao, m.unidade_base,
            p.contrato, p.ambiente, c.name AS cliente
     FROM "tblXmlConsumo" xc
     JOIN "tblMateriais" m ON m.id = xc.material_id
     JOIN "tblProjetos" p  ON p.ordemdecompra = xc.ordemdecompra
     LEFT JOIN "tblClientes" c ON c.id = p.id_cliente
     WHERE xc.status = 'RESERVADO'
        OR (xc.status = 'PENDENTE' AND COALESCE(m.estoque_minimo_un, 0) <= 0)
     ORDER BY xc.id ASC`,
    { type: QueryTypes.SELECT },
  );
}

// Lista de separação física — todo item ainda não baixado (PENDENTE ou
// RESERVADO) de um pedido, pra imprimir e o almoxarifado ir atrás fisicamente.
// Já traz a quebra de saldo por localização de cada material, pra dizer
// pra onde ir (recebimento entra junto, só marcado, porque mesmo "aguardando
// transferência" é informação útil de "onde está agora").
async function listarItensPedidoParaSeparacao(ordemdecompra) {
  const itens = await sequelize.query(
    `SELECT xc.id, xc.material_id, xc.qtd_xml, xc.unidade_xml, xc.qtd_un_confirmada,
            xc.detalhes, xc.status,
            m.codigo_interno, m.descricao, m.unidade_base,
            p.contrato, p.ambiente, p.pedido, c.name AS cliente
     FROM "tblXmlConsumo" xc
     JOIN "tblMateriais" m ON m.id = xc.material_id
     JOIN "tblProjetos" p  ON p.ordemdecompra = xc.ordemdecompra
     LEFT JOIN "tblClientes" c ON c.id = p.id_cliente
     WHERE xc.ordemdecompra = :ordemdecompra
       AND xc.status IN ('PENDENTE', 'RESERVADO')
     ORDER BY m.codigo_interno ASC`,
    { replacements: { ordemdecompra }, type: QueryTypes.SELECT },
  );
  if (itens.length === 0) return { contrato: null, ambiente: null, cliente: null, pedido: null, itens: [] };

  const materialIds = [...new Set(itens.map((i) => i.material_id))];
  const saldos = await sequelize.query(
    `SELECT em.material_id,
            (l.rua || '-' || l.prateleira || '-' || l.nivel || '-' || l.divisao) AS codigo,
            l.padrao_recebimento,
            CAST(SUM(em.qtd_un) AS FLOAT) AS saldo
     FROM "tblEstoqueMovimentos" em
     JOIN "tblLocalizacoes" l ON l.id = em.localizacao_id
     WHERE em.material_id IN (:materialIds)
     GROUP BY em.material_id, l.id, l.rua, l.prateleira, l.nivel, l.divisao, l.padrao_recebimento
     HAVING SUM(em.qtd_un) > 0
     ORDER BY l.padrao_recebimento ASC, l.rua, l.prateleira, l.nivel, l.divisao`,
    { replacements: { materialIds }, type: QueryTypes.SELECT },
  );

  const localizacoesPorMaterial = new Map();
  for (const s of saldos) {
    if (!localizacoesPorMaterial.has(s.material_id)) localizacoesPorMaterial.set(s.material_id, []);
    localizacoesPorMaterial.get(s.material_id).push({
      codigo: s.codigo,
      saldo: Number(s.saldo),
      padraoRecebimento: s.padrao_recebimento,
    });
  }

  const primeiro = itens[0];
  return {
    contrato: primeiro.contrato,
    ambiente: primeiro.ambiente,
    cliente: primeiro.cliente,
    pedido: primeiro.pedido,
    itens: itens.map((i) => ({
      id: i.id,
      codigoInterno: i.codigo_interno,
      descricao: i.descricao,
      detalhes: i.detalhes,
      unidadeBase: i.unidade_base,
      quantidade: i.qtd_un_confirmada != null ? Number(i.qtd_un_confirmada) : Number(i.qtd_xml),
      unidade: i.qtd_un_confirmada != null ? 'UN' : i.unidade_xml,
      status: i.status,
      localizacoes: localizacoesPorMaterial.get(i.material_id) || [],
    })),
  };
}

// Saldo físico de um material numa localização específica — base pro ajuste
// por contagem (inventário): mostra o que o sistema acha que tem ali antes
// do usuário informar o que contou de verdade.
async function saldoPorLocalizacao(materialId, localizacaoId) {
  const total = await EstoqueMovimentos.sum('qtdUn', { where: { materialId, localizacaoId } });
  return Number(total) || 0;
}

// Quebra do saldo físico de um material por localização — usado na consulta
// rápida do Estoque (clicar num material e ver onde ele está fisicamente).
// "codigo" da localização não existe como coluna — é sempre montado a
// partir de rua/prateleira/nível/divisão.
async function saldoPorLocalizacoes(materialId) {
  const rows = await sequelize.query(
    `SELECT
       em.localizacao_id,
       (l.rua || '-' || l.prateleira || '-' || l.nivel || '-' || l.divisao) AS codigo,
       l.descricao,
       l.padrao_recebimento,
       CAST(SUM(em.qtd_un) AS FLOAT) AS saldo
     FROM "tblEstoqueMovimentos" em
     JOIN "tblLocalizacoes" l ON l.id = em.localizacao_id
     WHERE em.material_id = :materialId
     GROUP BY em.localizacao_id, l.id, l.rua, l.prateleira, l.nivel, l.divisao, l.descricao, l.padrao_recebimento
     HAVING SUM(em.qtd_un) > 0
     ORDER BY l.rua, l.prateleira, l.nivel, l.divisao`,
    { replacements: { materialId: Number(materialId) }, type: QueryTypes.SELECT },
  );
  return rows;
}

// Histórico de ajustes de estoque (tipo AJUSTE em tblEstoqueMovimentos) —
// pra consulta: "quando foi ajustado esse material" e "o que esse usuário
// ajustou". Filtro fica por conta do DataTable no front (coluna material/
// usuário já filtrável) — aqui só traz tudo com o contexto já resolvido.
async function listarHistoricoAjustes() {
  return sequelize.query(
    `SELECT em.id, em.data, em.qtd_un, em.observacoes,
            m.codigo_interno, m.descricao AS material_descricao,
            (l.rua || '-' || l.prateleira || '-' || l.nivel || '-' || l.divisao) AS localizacao_codigo,
            l.descricao AS localizacao_descricao,
            u.login AS usuario_login
     FROM "tblEstoqueMovimentos" em
     JOIN "tblMateriais" m     ON m.id = em.material_id
     JOIN "tblLocalizacoes" l  ON l.id = em.localizacao_id
     JOIN "tblUsuario" u       ON u.id = em.usuario_id
     WHERE em.tipo = 'AJUSTE'
     ORDER BY em.data DESC, em.id DESC
     LIMIT 500`,
    { type: QueryTypes.SELECT },
  );
}

module.exports = {
  buscarMaterial,
  saldoFisico,
  saldoReservado,
  saldoComprado,
  saldoSolicitado,
  buscarPrecoNaData,
  buscarFatorConversaoFornecedor,
  buscarChegouFabrica,
  buscarXmlConsumo,
  listarXmlConsumoPorPedido,
  listarPendentesDoPedido,
  buscarLote,
  listarOrdensDoLote,
  listarPendentesOuReservados,
  criarMovimento,
  atualizarPrecoSeMaisNovo,
  listarAbaixoDoMinimo,
  listarSaldoPorMaterial,
  listarProntosParaBaixa,
  listarItensPedidoParaSeparacao,
  listarSemEstoqueParaPedidos,
  saldoPorLocalizacao,
  saldoPorLocalizacoes,
  listarHistoricoAjustes,
  buscarMateriaisPorId,
  criarImportacao,
  criarConsumos,
  buscarContratoPedido,
  criarConsumoManual,
  removerConsumoManual,
  sequelize,
};
