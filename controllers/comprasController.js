const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getAcessoriosCompras: createRpcHandler("listar_acessorios_compras", "query"),
  setAcessorios: createRpcHandler("atualizar_acessorios", "body"),
};
