const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  fillElements: createRpcHandler("buscar_projeto_capa_producao"),
};
