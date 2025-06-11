const { createRpcHandler } = require("./rpcHandlerFactory");
module.exports = {
  fillTablePrevisao: createRpcHandler("get_project_previsao", "query"),
  getPrevisao: createRpcHandler("get_previsao", "query"),
};
