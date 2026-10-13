'use strict';
const { DataTypes } = require('sequelize');

// Nada impedia lançar a mesma nota fiscal duas vezes (duplicaria estoque e
// valor_total). Duas travas:
//   1. chave de acesso da NF-e (44 dígitos, só quando vem de XML) — única
//      por natureza, índice único parcial (nem toda nota tem, lançamento
//      manual não traz).
//   2. (fornecedor_id, numero_nota) — rede de segurança pro lançamento
//      manual, onde não existe chave de acesso.
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('tblNotasFiscais', 'chave', {
      type: DataTypes.STRING(44),
      allowNull: true,
    });

    await queryInterface.addIndex('tblNotasFiscais', ['chave'], {
      unique: true,
      name: 'tblNotasFiscais_chave_uq',
      where: { chave: { [require('sequelize').Op.ne]: null } },
    });

    await queryInterface.addIndex('tblNotasFiscais', ['fornecedor_id', 'numero_nota'], {
      unique: true,
      name: 'tblNotasFiscais_fornecedor_numero_uq',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('tblNotasFiscais', 'tblNotasFiscais_fornecedor_numero_uq');
    await queryInterface.removeIndex('tblNotasFiscais', 'tblNotasFiscais_chave_uq');
    await queryInterface.removeColumn('tblNotasFiscais', 'chave');
  },
};
