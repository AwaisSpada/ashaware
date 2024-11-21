// function admin(req, res, next) {
//     if (req.user.role != "admin")
//       return res.status(403).send("You are not authorized");
//     next();
//   }
//   module.exports = admin;
"use strict";
const jwtHelper = require("./jwt");
let isAdmin = (req, res, next) => {
  let token = req.header("x-auth-token"); // in header token will be send in "x-auth-token" variable
  if (token) {
    const isVerified = jwtHelper.verify(token);
    if (isVerified.role === "admin") {
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
  isAdmin: isAdmin,
};
