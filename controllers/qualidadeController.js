const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getPecasQualidade: createRpcHandler("get_pecas_qualidade", "query"),
  updateCausaRaiz: createRpcHandler("update_causa_raiz", "body"),
};
