'use strict';
const { Op } = require('sequelize');
const { Materiais, MateriaisReferenciaPromob } = require('../client/db');

// Pra cada item do XML (já agrupado por referência), tenta casar com um
// material do cadastro: 1º por vínculo salvo antes, senão por código interno
// idêntico à referência do Promob. Sem bater nenhum dos dois, fica sem
// materialId — a tela de revisão decide o que fazer (trocar ou vincular).
async function casarItens(itens) {
  const referencias = [...new Set(itens.map(i => i.referencia).filter(Boolean))];
  if (!referencias.length) return itens.map(i => ({ ...i, materialId: null }));

  const vinculos = await MateriaisReferenciaPromob.findAll({
    where: { referenciaPromob: { [Op.in]: referencias } },
    raw: true,
  });
  const porVinculo = new Map(vinculos.map(v => [v.referenciaPromob, v.materialId]));

  const semVinculo = referencias.filter(r => !porVinculo.has(r));
  const porCodigo = new Map();
  if (semVinculo.length) {
    const materiais = await Materiais.findAll({
      where: { codigoInterno: { [Op.in]: semVinculo } },
      raw: true,
    });
    for (const m of materiais) porCodigo.set(m.codigoInterno, m.id);
  }

  return itens.map(item => ({
    ...item,
    materialId: porVinculo.get(item.referencia) ?? porCodigo.get(item.referencia) ?? null,
  }));
}

// Salva (ou atualiza) a associação permanente referência-Promob -> material.
async function vincular(referenciaPromob, materialId, usuarioId) {
  const [row] = await MateriaisReferenciaPromob.findOrCreate({
    where: { referenciaPromob },
    defaults: { materialId, usuarioId },
  });
  if (row.materialId !== materialId) {
    row.materialId = materialId;
    row.usuarioId = usuarioId;
    row.dataVinculo = new Date();
    await row.save();
  }
  return row;
}

module.exports = { casarItens, vincular };
