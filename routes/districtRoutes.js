var express = require("express");
const { checkToken } = require("../Middlewares/tokenAuth");
const { isSuperAdmin } = require("../Middlewares/isSuperAdmin");
const district = require("../Controllers/district-controller");
var router = express.Router();
////////District Api//////////
router.post("/addDistrict", district.AddDistrict); //checkToken, isSuperAdmin,
router.get(
  "/getDistrictById/:id",
  checkToken,
  isSuperAdmin,
  district.GetDistrictById
);
router.get(
  "/getAllDistrict",
  checkToken,
  isSuperAdmin,
  district.GetAllDistrict
);
router.put(
  "/updateDistrictById/:id",
  checkToken,
  isSuperAdmin,
  district.UpdateDistrictById
);
router.post(
  "/removeDistrictById/:id",
  checkToken,
  isSuperAdmin,
  district.RemoveDistrictById
);
router.post("/districtAllData", checkToken, district.districtAllData);
router.post("/getDistrictUser", checkToken, district.getDistrictUser);
router.get("/districtClasses", checkToken, district.districtAllClasses);
router.get("/districtAllDetails", checkToken, district.districtAllDetails);
module.exports = router;
