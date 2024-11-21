var express = require("express");
const school = require("../Controllers/school-controller");
const { checkToken } = require("../Middlewares/tokenAuth");
const { isSuperAdmin } = require("../Middlewares/isSuperAdmin");
const { SchoolAccess } = require("../Middlewares/schoolAccess");
var router = express.Router();
////////School Api//////////
router.get(
  "/getSchoolById/:id",
  checkToken,
  // SchoolAccess,
  school.GetSchoolById,
);
router.get(
  "/getAllSchool",
  checkToken,
  SchoolAccess,
  // isSuperAdmin,
  school.GetAllSchool,
);
router.put(
  "/updateSchoolById/:id",
  checkToken,
  // SchoolAccess,
  school.UpdateSchoolById,
);
router.post(
  "/removeSchoolById/:id",
  checkToken,
  SchoolAccess,
  school.RemoveSchoolById,
);
router.get("/schoolByToken", checkToken, school.schoolFromToken);
router.post("/addSchool", checkToken, school.AddSchool);
router.get("/allStats", checkToken, isSuperAdmin, school.stats);
router.post("/getSchoolUser", checkToken, school.getSchoolUser);
router.post("/schoolAllData", checkToken, school.schoolAllData);
router.get("/schoolUserStats", checkToken, school.getSchoolStats);
router.get("/schoolClasses", checkToken, school.getSchoolClasses);
// teacher information
router.get("/teacher-info/:teacherId", school.getTeacherInfo);

module.exports = router;
