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

// Cadastro
router.post("/", rp("novo_pedido"), add.createProject);
router.post("/cliente", rp("novo_pedido"), add.createClient);

// Edição
router.get("/editar", rp("editar_pedido"), edit.getEditProjetos);
router.post("/editar", rp("editar_pedido"), edit.setEditProjetos);

// Exclusão
router.get("/deletar", rp("excluir_pedido"), del.getDeleteProjetos);
router.post("/deletar", rp("excluir_pedido"), del.setDeleteProjeto);

module.exports = router;
