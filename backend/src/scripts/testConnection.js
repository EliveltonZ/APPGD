require("dotenv").config({ path: __dirname + "/../client/.env" });
const sequelize = require("../client/sequelize");

async function test() {
  try {
    await sequelize.authenticate();
    console.log("✓ Conexão com o banco estabelecida com sucesso.");
  } catch (err) {
    console.error("✗ Falha na conexão:", err.message);
  } finally {
    await sequelize.close();
  }
}

test();
