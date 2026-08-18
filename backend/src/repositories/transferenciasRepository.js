'use strict';

const { sequelize, Transferencias, EstoqueMovimentos } = require('../client/db');

async function listarSaldo(materialId) {
  const [rows] = await sequelize.query(
    `SELECT
       em.localizacao_id,
       l.codigo,
       l.descricao,
       CAST(SUM(em.qtd_un) AS FLOAT) AS saldo
     FROM "tblEstoqueMovimentos" em
     JOIN "tblLocalizacoes" l ON l.id = em.localizacao_id
     WHERE em.material_id = :materialId
     GROUP BY em.localizacao_id, l.id, l.codigo, l.descricao
     HAVING SUM(em.qtd_un) > 0
     ORDER BY l.codigo`,
    { replacements: { materialId: Number(materialId) } },
  );
  return rows;
}

async function listar() {
  const [rows] = await sequelize.query(
    `SELECT
       t.id,
       t.data,
       CAST(t.qtd_un AS FLOAT) AS qtd_un,
       t.observacoes,
       m.codigo_interno,
       m.descricao AS material_descricao,
       lo.codigo   AS origem_codigo,
       lo.descricao AS origem_descricao,
       ld.codigo   AS destino_codigo,
       ld.descricao AS destino_descricao,
       u.login     AS usuario_login
     FROM "tblTransferencias" t
     JOIN "tblMateriais"    m  ON m.id  = t.material_id
     JOIN "tblLocalizacoes" lo ON lo.id = t.localizacao_origem_id
     JOIN "tblLocalizacoes" ld ON ld.id = t.localizacao_destino_id
     JOIN "tblUsuario"      u  ON u.id  = t.usuario_id
     ORDER BY t.data DESC, t.id DESC
     LIMIT 200`,
  );
  return rows;
}

async function criar(body, usuarioId) {
  const qtd = parseFloat(body.qtd_un);
  if (!Number.isFinite(qtd) || qtd <= 0) throw new Error('Quantidade inválida.');

  const origemId  = Number(body.localizacao_origem_id);
  const destinoId = Number(body.localizacao_destino_id);
  if (origemId === destinoId) throw new Error('Origem e destino não podem ser iguais.');

  return sequelize.transaction(async (t) => {
    const [[saldoRow]] = await sequelize.query(
      `SELECT COALESCE(SUM(qtd_un), 0) AS saldo
       FROM "tblEstoqueMovimentos"
       WHERE material_id = :materialId AND localizacao_id = :origemId`,
      { replacements: { materialId: Number(body.material_id), origemId }, transaction: t },
    );
    const saldoDisponivel = parseFloat(saldoRow.saldo);
    if (saldoDisponivel < qtd) {
      throw new Error(`Saldo insuficiente. Disponível: ${saldoDisponivel.toFixed(3)} UN.`);
    }

    const data = body.data ? new Date(body.data) : new Date();

    const transfer = await Transferencias.create({
      materialId:           Number(body.material_id),
      localizacaoOrigemId:  origemId,
      localizacaoDestinoId: destinoId,
      qtdUn:                qtd,
      data,
      usuarioId:            Number(usuarioId),
      observacoes:          body.observacoes || null,
    }, { transaction: t });

    const base = {
      materialId:      Number(body.material_id),
      transferenciaId: transfer.id,
      data,
      usuarioId:       Number(usuarioId),
      observacoes:     body.observacoes || null,
    };

    await EstoqueMovimentos.create({ ...base, localizacaoId: origemId,  tipo: 'TRANSF_SAIDA',   qtdUn: -qtd }, { transaction: t });
    await EstoqueMovimentos.create({ ...base, localizacaoId: destinoId, tipo: 'TRANSF_ENTRADA', qtdUn:  qtd }, { transaction: t });

    return { id: transfer.id };
  });
}

module.exports = { listarSaldo, listar, criar };
