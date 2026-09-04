require("dotenv").config({ path: __dirname + "/.env" });
const { Sequelize } = require("sequelize");
const { types } = require("pg");
const { parseNaiveBR } = require("../utils/dateBR");

// OID 1114 = "timestamp without time zone". Sem isso, o driver `pg` converte
// essas colunas usando o timezone do processo Node, que varia por ambiente
// (ver utils/dateBR.js para o motivo completo do bug).
types.setTypeParser(1114, parseNaiveBR);

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  timezone: "-03:00",
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;
