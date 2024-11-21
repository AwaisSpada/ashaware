"use strict";
const jwtHelper = require("./jwt");

let checkToken = (req, res, next) => {
  // console.log("In checkToken middleware");
  let token = req.header("x-auth-token");
  console.log("token", token); // in header token will be send in "x-auth-token" variable
  if (token) {
    const isVerified = jwtHelper.verify(token);
    if (isVerified) {
      req.userId = isVerified.id;
      next();
    } else {
      return res.json({
        success: 404,
        message: "Token is not valid",
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
  checkToken: checkToken,
};
