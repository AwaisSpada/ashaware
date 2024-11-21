"use strict";
const jwt = require("jsonwebtoken");

module.exports = {
  issue(payload, expiresIn) {
    // token will be issue with the given payload and expire time
    return jwt.sign(payload, process.env.jwtSecret, {
      //process.env.jwtSecret
      expiresIn: expiresIn ? expiresIn : "1d",
    });
  },
  verify(token) {
    try {
      return jwt.verify(token, process.env.jwtSecret); //
    } catch (err) {
      return false;
    }
  },
};
