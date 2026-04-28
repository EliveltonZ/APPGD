const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  setUserAccess: createRpcHandler("atualizar_acessos", "body"),
  getUserAccess: createRpcHandler("buscar_acesso"),
};
