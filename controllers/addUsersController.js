const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getMaxId: createRpcHandler("buscar_maior_id"),
  insertUser: createRpcHandler("inserir_usuario", "body"),
};
