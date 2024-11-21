var express = require("express");
const subject = require("../Controllers/subject-controller");
var router = express.Router();
////////Subject Api//////////
router.post("/addSubject", subject.AddSubject);
router.get("/allSubjects", subject.getAllSubjects);
router.post("/removeSubjectById/:id", subject.removeSubject);
module.exports = router;
