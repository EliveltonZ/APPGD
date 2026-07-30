require("dotenv").config({ path: __dirname + "/../client/.env" });
const SequelizeAuto = require("sequelize-auto");

const dbUrl = new URL(process.env.DATABASE_URL);

const auto = new SequelizeAuto(
  dbUrl.pathname.replace("/", ""),  // database
  dbUrl.username,                   // user
  decodeURIComponent(dbUrl.password), // password
  {
    host: dbUrl.hostname,
    port: Number(dbUrl.port) || 5432,
    dialect: "postgres",
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
    directory: __dirname + "/../models",
    caseModel: "c",
    caseFile: "c",
    caseProp: "c",
    lang: "cjs",
    noWrite: false,
    schema: "public",
  },
);

auto.run().then(() => {
  console.log("✓ Models gerados em src/models/");
}).catch((err) => {
  console.error("✗ Erro:", err.message);
});
