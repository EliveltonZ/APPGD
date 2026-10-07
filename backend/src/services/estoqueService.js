'use strict';
const repo = require('../repositories/estoqueRepository');

function erro(mensagem, status, code) {
  return Object.assign(new Error(mensagem), { status, code });
}

async function calcularSaldo(materialId) {
  const [fisico, reservado, comprado, solicitado] = await Promise.all([
    repo.saldoFisico(materialId),
    repo.saldoReservado(materialId),
    repo.saldoComprado(materialId),
    repo.saldoSolicitado(materialId),
  ]);
  const disponivel      = fisico - reservado;
  const saldoBloqueio   = fisico - reservado + comprado;
  const saldoVisibilidade = saldoBloqueio + solicitado;
  return { fisico, reservado, comprado, solicitado, disponivel, saldoBloqueio, saldoVisibilidade };
}

// Custo = quantidade do XML (m² ou unidade) × preço por m²/unidade vigente na
// data do chegoufabrica do pedido (fallback: último preço conhecido do material).
async function calcularCusto(xmlConsumo, material) {
  const chegoufabrica = await repo.buscarChegouFabrica(xmlConsumo.ordemdecompra);
  const precoHistorico = await repo.buscarPrecoNaData(material.id, chegoufabrica);
  const preco = precoHistorico ?? material.ultimoPrecoUn ?? null;
  if (preco == null) return { preco: null, custo: null };

  const fatorConversao = xmlConsumo.unidadeXml === 'M2' ? (material.m2PorUnidade || 1) : 1;
  const custo = Number(xmlConsumo.qtdXml) * (Number(preco) / Number(fatorConversao));
  return { preco: Number(preco), custo };
}

async function reservar(xmlConsumoId, usuarioId) {
  const linha = await repo.buscarXmlConsumo(xmlConsumoId);
  if (!linha) return null;
  if (linha.status !== 'PENDENTE') {
    throw erro('Só é possível reservar um item PENDENTE.', 409, 'STATUS_INVALIDO');
  }
  const qtd = Number(linha.qtdUnConfirmada);
  if (!qtd || qtd <= 0) {
    throw erro('Informe a quantidade em unidade antes de reservar.', 400, 'VALIDACAO');
  }

  const saldo = await calcularSaldo(linha.materialId);
  if (saldo.saldoBloqueio < qtd) {
    throw erro(
      `Saldo insuficiente para reservar (disponível com compras: ${saldo.saldoBloqueio}, necessário: ${qtd}).`,
      409, 'SALDO_INSUFICIENTE',
    );
  }

  linha.status = 'RESERVADO';
  linha.dataReserva = new Date();
  linha.usuarioReservaId = usuarioId;
  await linha.save();
  return linha;
}

async function liberarReserva(xmlConsumoId) {
  const linha = await repo.buscarXmlConsumo(xmlConsumoId);
  if (!linha) return null;
  if (linha.status !== 'RESERVADO') {
    throw erro('Só é possível liberar um item RESERVADO.', 409, 'STATUS_INVALIDO');
  }
  linha.status = 'PENDENTE';
  linha.dataReserva = null;
  linha.usuarioReservaId = null;
  await linha.save();
  return linha;
}

async function darBaixa(xmlConsumoId, { qtdUnBaixada, localizacaoId, usuarioId }) {
  const linha = await repo.buscarXmlConsumo(xmlConsumoId);
  if (!linha) return null;
  if (!['PENDENTE', 'RESERVADO'].includes(linha.status)) {
    throw erro('Item já foi baixado ou está cancelado.', 409, 'STATUS_INVALIDO');
  }

  const material = await repo.buscarMaterial(linha.materialId);
  const minimoControlado = Number(material.estoqueMinimoUn) > 0;
  if (minimoControlado && linha.status !== 'RESERVADO') {
    throw erro('Este material exige reserva antes da baixa.', 409, 'RESERVA_OBRIGATORIA');
  }

  const qtd = Number(qtdUnBaixada);
  if (!qtd || qtd <= 0) {
    throw erro('Informe a quantidade realmente consumida.', 400, 'VALIDACAO');
  }
  if (!localizacaoId) {
    throw erro('Informe a localização de onde o material está saindo.', 400, 'VALIDACAO');
  }

  // Se baixar mais do que foi reservado, o excedente também precisa caber no saldo.
  const reservadoNestaLinha = linha.status === 'RESERVADO' ? Number(linha.qtdUnConfirmada) : 0;
  const excedente = qtd - reservadoNestaLinha;
  if (excedente > 0) {
    const saldo = await calcularSaldo(linha.materialId);
    if (saldo.saldoBloqueio < excedente) {
      throw erro(
        `Saldo insuficiente para a baixa (excedente sobre o reservado: ${excedente}, disponível: ${saldo.saldoBloqueio}).`,
        409, 'SALDO_INSUFICIENTE',
      );
    }
  }

  const { preco, custo } = await calcularCusto(linha, material);

  return repo.sequelize.transaction(async (t) => {
    linha.status = 'EXECUTADO';
    linha.qtdUnBaixada = qtd;
    linha.precoUnSnapshot = preco;
    linha.custoCalculado = custo;
    linha.dataBaixa = new Date();
    linha.usuarioBaixaId = usuarioId;
    await linha.save({ transaction: t });

    await repo.criarMovimento({
      materialId: linha.materialId,
      localizacaoId,
      tipo: 'BAIXA',
      qtdUn: -qtd,
      precoUn: preco,
      ordemdecompra: linha.ordemdecompra,
      xmlConsumoId: linha.id,
      usuarioId,
    }, { transaction: t });

    return linha;
  });
}

async function listarAlertaMinimo() {
  return repo.listarAbaixoDoMinimo();
}

module.exports = {
  calcularSaldo,
  reservar,
  liberarReserva,
  darBaixa,
  listarAlertaMinimo,
};
