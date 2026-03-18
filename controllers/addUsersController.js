const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getMaxId: createRpcHandler("get_max_id", "query"),
  insertUser: createRpcHandler("insert_usuario", "body"),
};
