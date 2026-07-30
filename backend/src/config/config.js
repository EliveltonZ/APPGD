require('dotenv').config({ path: __dirname + '/../client/.env' });

const shared = {
  url: process.env.DATABASE_URL,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
};

module.exports = {
  development: shared,
  test:        shared,
  production:  shared,
};
