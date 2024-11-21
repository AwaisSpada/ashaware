var express = require("express");
const user = require("../Controllers/user-controller");
const { checkToken } = require("../Middlewares/tokenAuth");
const { isSuperAdmin } = require("../Middlewares/isSuperAdmin");
const { checkIsDistrictAdmin } = require("../Middlewares/isDistrictAdmin");
// const { limiter } = require("../utilities/limiter");
var router = express.Router();
////////User Api//////////
router.post("/login", user.Login); //limiter,
router.post("/signup", user.AddUser);
router.get("/allTeachers", checkToken, user.GetAllTeachers);
router.get("/getUserById/:userId", checkToken, user.GetUserById); //add limiter as a middleware
router.get("/allUsers", checkToken, isSuperAdmin, user.GetAllUsers); //limiter,//add limiter as middleware
router.post("/removeUserById/:id", checkToken, user.RemoveUserById);
router.put(
  "/updateUserById/:userId",
  checkToken,
  // isSuperAdmin,
  user.updateUserById,
);
///////All Students//////
router.get("/allStudents", checkToken, user.getAllStudents);
////////////////////////
router.get("/auth", checkToken, user.UserAuth);
///// Invitation link email Verification //////
router.post("/verifyEmail", user.VerifyEmail);
router.post("/generateEmailToken", user.GenerateEmailToken);
router.post("/inviteUser", checkToken, isSuperAdmin, user.Invitation);
/////// Login with Facebook/Google////////
router.post("/districtAdminGoogleLogin", user.DistrictAdminGoogleLogin);
router.post("/districtAdminFacebookLogin", user.DistrictAdminFacebookLogin);
///////////distrcit Admin Login///////
router.post("/districtAdminLogin", user.districtAdminLogin);
/////Schools By District/////
router.get(
  "/schoolsByDistrictAdmin",
  checkToken,
  checkIsDistrictAdmin,
  user.schoolsByDistrictAdmin,
);
////////All Models Data/////////
router.post("/getAllModelsData", user.getAllModelsData); //checkToken
/////////School Users/////////
router.post("/schoolUsers", checkToken, user.schoolUserCreation);
///////////////for reset user password///////////////
router.post("/forgetPasswordEmail", user.forgetPasswordEmail);
router.post("/updatePassword", user.forgetPasswordCheck);

module.exports = router;
