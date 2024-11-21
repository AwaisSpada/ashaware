var express = require("express");

const { checkToken } = require("../Middlewares/tokenAuth");
const { isTeacher } = require("../Middlewares/isTeacher");
const { isStudent } = require("../Middlewares/isStudent");
const assignment = require("../Controllers/assignment-controller");
const multer = require("multer");

var router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

////////District Api//////////

router.post("/addAssignment", isTeacher, checkToken, assignment.addAssignment);

router.post(
  "/mark-assignment",
  isTeacher,
  checkToken,
  assignment.markAssignment
);

router.post(
  "/submit-assignment",
  isStudent,
  checkToken,
  upload.single("file"),
  assignment.submitAssignment
);

router.get("/allAssignment", checkToken, assignment.getAllAssignments);

router.get(
  "/allSubmittedAssignment",
  checkToken,
  assignment.getAllSubmittedAssignments
);

router.get(
  "/getAssignment/:assignmentId",
  checkToken,
  assignment.getAssignment
);

router.put(
  "/deleteAssignment/:assignmentId",
  checkToken,
  assignment.deleteAssignment
);

router.put(
  "/updateAssignment/:assignmentId",
  isTeacher,
  checkToken,
  assignment.updateAssignment
);

module.exports = router;
