require('dotenv').config({ path: require('path').resolve(__dirname, '../client/.env') });

// Ambiente único hoje (sempre a mesma base) — mas sequelize-cli exige uma
// chave por NODE_ENV, e sem isso rodar uma migration sem NODE_ENV=production
// setado cai no "development" (inexistente) e quebra.
const shared = {
  url:     process.env.DATABASE_URL,
  dialect: 'postgres',
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
  timezone: '-03:00',
};

module.exports = {
  development: shared,
  test:        shared,
  production:  shared,
};
