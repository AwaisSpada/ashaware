var express = require("express");

const { checkToken } = require("../Middlewares/tokenAuth");
const { isTeacher } = require("../Middlewares/isTeacher");
const { isStudent } = require("../Middlewares/isStudent");
const question = require("../Controllers/question-controller");
const answer = require("../Controllers/answer-controller");

var router = express.Router();

//////// Questions Api//////////
router.post("/addQuestion", isTeacher, checkToken, question.AddQuestion);
router.post("/submit-answer", isStudent, checkToken, answer.submitAnswer);
router.post("/checked", isTeacher, checkToken, question.markAnswer);
router.get("/allQuestions", checkToken, question.getAllQuestions);
router.get("/answers", checkToken, question.getAllAnswers);
router.get("/getQuestion/:questionId", checkToken, question.getQuestion);
router.put("/deleteQuestion/:questionId", checkToken, question.deleteQuestion);

router.put(
  "/updateQuestion/:questionId",
  isTeacher,
  checkToken,
  question.updateQuestion
);

router.put(
  "/answer/:questionId",
  isStudent,
  checkToken,
  question.answerOfQuestion
);

module.exports = router;
