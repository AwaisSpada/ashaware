var express = require("express");
const Class = require("../Controllers/class-controller");
const { checkToken } = require("../Middlewares/tokenAuth");
const { ClassAccess } = require("../Middlewares/classAccess");
const { isSuperAdmin } = require("../Middlewares/isSuperAdmin");
var router = express.Router();
/////////Class Api//////
router.post("/addClass", checkToken, Class.AddClass); //ClassAccess
router.get(
  "/getAllClasses",
  checkToken,
  ClassAccess,
  isSuperAdmin,
  Class.GetAllClasses,
);
router.get("/getClassById/:id", checkToken, Class.GetClassById); //ClassAccess,
router.put(
  "/updateClassById/:id",
  checkToken,
  // ClassAccess,
  Class.UpdateClassById,
);
router.post(
  "/removeClassById/:id",
  checkToken,
  // ClassAccess,
  Class.RemoveClassById,
);
router.post("/schoolClass", checkToken, Class.schoolClassCreation);
////////////////////teacher's Api//////////////////////
router.get("/teacherClasses", checkToken, Class.teacherClasses);
router.get("/teacherStudents", checkToken, Class.teacherStudents);
router.get("/teacherStats", checkToken, Class.teacherStats);
module.exports = router;
