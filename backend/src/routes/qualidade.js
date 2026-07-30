const router = require("express").Router();
const c = require("../controllers/qualidadeController");
const rp = require("../middlewares/requirePermission");

const qualidade = rp("qualidade");

router.get("/", qualidade, c.getPecasQualidade);
router.post("/causa", qualidade, c.updateCausaRaiz);
router.get("/causas", qualidade, c.getCausaFalha);

module.exports = router;
