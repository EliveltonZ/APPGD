const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getContratoPendencias: createRpcHandler("get_contrato_pendencia", "query"),
  fillTableAPendencia: createRpcHandler("get_acessorios_pendencias", "query"),
  insertAcessorios: createRpcHandler("insert_acessorios", "body"),
  delAcessorios: createRpcHandler("del_acessorio", "body"),
};
