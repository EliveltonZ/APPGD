const { createRpcHandler } = require("./rpcHandlerFactory");

// Exportando as funções
module.exports = {
  fillTable: createRpcHandler("get_project_exp", "query"),
  getExpedicao: createRpcHandler("get_expedicao", "query"),
  setDataExpedicao: createRpcHandler("set_expedicao", "body"),
};
