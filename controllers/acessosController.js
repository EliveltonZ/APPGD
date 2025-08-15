const supabase = require("../client/clientSupabase");
const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  setUserAccess: createRpcHandler("set_acesso", "body"),
  getUserAccess: createRpcHandler("get_acesso", "query"),
};
