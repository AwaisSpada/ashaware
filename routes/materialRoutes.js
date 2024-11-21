var express = require("express");
const { checkToken } = require("../Middlewares/tokenAuth");
const { isTeacher } = require("../Middlewares/isTeacher");
const material = require("../Controllers/material-controller");
var router = express.Router();
////////District Api//////////
router.post("/addMaterial", isTeacher, checkToken, material.addMeterial);

router.get("/allMaterials", checkToken, material.getAllMaterials);

router.get("/getMaterial/:materialId", checkToken, material.getMaterial);

router.put("/deleteMaterial/:materialId", checkToken, material.deleteMaterial);

router.put(
  "/updateMaterial/:materialId",
  isTeacher,
  checkToken,
  material.updateMaterial
);

module.exports = router;
