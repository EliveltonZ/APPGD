'use strict';

// Item 2 de docs/seguranca-pendencias.md: 133 de 159 usuarios ainda tinham
// senha em texto puro (o login so convertia pra bcrypt no primeiro acesso
// de cada um). Converte tudo de uma vez via pgcrypto (ja instalada no
// banco), gerando hash $2a$ compativel com bcryptjs -- o login continua
// aceitando a mesma senha de sempre.
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE "tblUsuario"
         SET senha = crypt(senha, gen_salt('bf', 12))
       WHERE senha IS NOT NULL AND senha NOT LIKE '$2%';
    `);
  },

  // Irreversivel por natureza -- hash nao volta a ser a senha original.
  // Não há como desfazer; se algo der errado, restaurar de um backup do banco.
  async down() {},
};
