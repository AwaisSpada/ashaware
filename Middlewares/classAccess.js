"use strict";
const jwtHelper = require("./jwt");
let ClassAccess = (req, res, next) => {
  let token = req.header("x-auth-token"); // in header token will be send in "x-auth-token" variable
  if (token) {
    const isVerified = jwtHelper.verify(token);
    if (
      isVerified.role === "superAdmin" ||
      isVerified.role === "districtAdmin" ||
      isVerified.role === "schoolAdmin" ||
      isVerified.role === "teacher"
    ) {
      next();
    } else {
      return res.json({
        success: 401,
        message: "Unauthorize access",
      });
    }
  } else {
    return res.json({
      success: 404,
      message: "Token is not provided",
      missingParameters: ["login_token"],
    });
  }
};

module.exports = {
  ClassAccess: ClassAccess,
};
