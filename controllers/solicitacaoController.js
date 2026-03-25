const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getConfig: createRpcHandler("get_config", "query"),
  setEquipSat: createRpcHandler("set_equip_sat", "body"),
};
