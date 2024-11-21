"use strict";
const jwtHelper = require("./jwt");
let isSuperAdmin = (req, res, next) => {
  // console.log("In isSuperAdmin middleware");
  let token = req.header("x-auth-token"); // in header token will be send in "x-auth-token" variable
  if (token) {
    const isVerified = jwtHelper.verify(token);
    console.log("role", isVerified);
    if (isVerified.role === "superAdmin") {
      req.userRole = isVerified.role;
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
  isSuperAdmin: isSuperAdmin,
};
