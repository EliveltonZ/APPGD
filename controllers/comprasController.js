const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getAcessoriosCompras: createRpcHandler("get_acessorios_compras", "query"),
  setAcessorios: createRpcHandler("set_acessorios", "body"),
};
