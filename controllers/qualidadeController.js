const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getPecasQualidade: createRpcHandler("listar_pecas_qualidade"),
  updateCausaRaiz: createRpcHandler("update_causa_raiz", "body"),
};
