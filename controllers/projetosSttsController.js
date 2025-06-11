const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  fillTable: createRpcHandler("get_project_stts", "query"),
  getStatus: createRpcHandler("get_status", "query"),
};
