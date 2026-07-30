const sequelize  = require("./sequelize");
const initModels = require("../models/init-models");

const models = initModels(sequelize);

module.exports = { sequelize, ...models };
