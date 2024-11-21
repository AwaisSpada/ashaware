var express = require("express");
const accounts = require("../Controllers/accounts-controller");
var router = express.Router();
////////Accounts Api////////
router.post("/addAccount", accounts.addAccount);
module.exports = router;
