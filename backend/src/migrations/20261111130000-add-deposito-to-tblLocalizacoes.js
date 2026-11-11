'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      const table = 'tblLocalizacoes';
      // Nível acima da posição de prateleira (rua/prateleira/nivel/divisao,
      // que continua existindo só dentro do Almoxarifado) — separa onde o
      // material está fisicamente "parado": Almoxarifado (estoque geral),
      // Fábrica (já destacado pra produção) ou Expedição (pronto pra sair).
      await queryInterface.addColumn(table, 'deposito', {
        type: Sequelize.STRING(20), allowNull: false, defaultValue: 'ALMOXARIFADO',
      }, { transaction: t });

      // Fábrica e Expedição são posições únicas e agregadas (não têm
      // prateleira/nível/divisão de verdade) — rua guarda só um rótulo fixo
      // pra identificar visualmente, nunca aparecem nos seletores de
      // localização de prateleira (Transferências, Nota Fiscal, Baixas).
      await queryInterface.bulkInsert(table, [
        { descricao: 'Fábrica',   rua: 'FABRICA',   prateleira: '-', nivel: '-', divisao: '-', ativo: true, padrao_recebimento: false, deposito: 'FABRICA' },
        { descricao: 'Expedição', rua: 'EXPEDICAO', prateleira: '-', nivel: '-', divisao: '-', ativo: true, padrao_recebimento: false, deposito: 'EXPEDICAO' },
      ], { transaction: t });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      const table = 'tblLocalizacoes';
      await queryInterface.bulkDelete(table, { deposito: ['FABRICA', 'EXPEDICAO'] }, { transaction: t });
      await queryInterface.removeColumn(table, 'deposito', { transaction: t });
    });
  },
};
