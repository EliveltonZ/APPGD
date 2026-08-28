const router = require("express").Router();
const add = require("../controllers/addProjetosController");
const edit = require("../controllers/editProjetosController");
const del = require("../controllers/deleteController");
const capa = require("../controllers/capaController");
const rp = require("../middlewares/requirePermission");

// Listagens de apoio (abertas para qualquer autenticado)
router.get("/contrato", add.selectContract);
router.get("/clientes", add.listClients);
router.get("/tipos-cliente", add.listTiposCliente);
router.get("/capa", capa.fillElements);

// OC para assistência (sequence atômica — segura contra concorrência)
router.get("/assistencia/proximo-oc", rp("nova_solicitacao"), add.getProximoOcAssistencia);

// Cadastro
router.post("/", rp("novo_pedido"), add.createProject);
router.post("/cliente", rp("novo_pedido"), add.createClient);

// Edição — aceita pedidos_editar OU assistencias_nova (mesma lógica do lançamento)
router.get("/editar", rp.any("editar_pedido", "nova_solicitacao"), edit.getEditProjetos);
router.post("/editar", rp.any("editar_pedido", "nova_solicitacao"), edit.setEditProjetos);

// Exclusão — aceita pedidos_excluir OU assistencias_nova
router.get("/deletar", rp.any("excluir_pedido", "nova_solicitacao"), del.getDeleteProjetos);
router.post("/deletar", rp.any("excluir_pedido", "nova_solicitacao"), del.setDeleteProjeto);

module.exports = router;
