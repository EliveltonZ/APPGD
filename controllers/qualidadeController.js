const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getPecasQualidade: createRpcHandler("get_pecas"),
  updateCausaRaiz: createRpcHandler("update_causa_raiz", "body"),
};
