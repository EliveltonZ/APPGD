require('dotenv').config({ path: require('path').resolve(__dirname, '../client/.env') });

module.exports = {
  production: {
    url:     process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
    timezone: '-03:00',
  },
};
