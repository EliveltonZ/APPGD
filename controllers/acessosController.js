const supabase = require("../client/clientSupabase");
const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getUserAccess: createRpcHandler("get_acesso", "query"),
  setUserAccess: createRpcHandler("set_acesso", "body"),
};
