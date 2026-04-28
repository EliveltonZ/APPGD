const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getConfig: createRpcHandler("get_config"),
  setEquipSat: createRpcHandler("set_equip_sat", "body"),
  getPecas: createRpcHandler("get_pecas"),
  getContratoAssist: createRpcHandler("buscar_contrato_assistencia"),
};
