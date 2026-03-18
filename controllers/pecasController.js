const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getOcorrencia: createRpcHandler("get_ocorrencias", "query"),
  getFalhas: createRpcHandler("get_falhas", "query"),
  setPecas: createRpcHandler("set_pecas", "body"),
};
