const messageUtil = require("../utilities/message");
const userServices = require("../services/userServices");
const classServices = require("../services/classServices");
const questionServices = require("../services/questionServices");
const Answer = require("../Models/submitted-answer");
const {
  successResponse,
  notFoundResponse,
  badRequestErrorResponse,
  serverErrorResponse,
  authorizationErrorResponse,
} = require("../utilities/response");
class Question {
  AddQuestion = async (req, res) => {
    let students = [];
    const { question, points, for_class, lesson_url, type, due_date } =
      req.body;
    let errors = [];
    if (!question) errors.push("question");
    if (!points) errors.push("points");
    if (!for_class) errors.push("for_class");
    if (!lesson_url) errors.push("lesson_url");
    if (!type) errors.push("type");
    if (!due_date) errors.push("due_date");
    if (errors.length > 0) {
      errors = errors.join(", ");
      return badRequestErrorResponse(res, `Please insert: ${errors}`);
    }
    if (req.body.type === "multiple-choice")
      if (!req.body.options)
        return badRequestErrorResponse(res, messageUtil.options_compulsory);
    try {
      let user = await userServices.getUserDetails({
        _id: req.userId,
        isDelete: false,
      });
      if (!user) return notFoundResponse(res, messageUtil.NotFound);
      if (user.userRole != "teacher")
        return authorizationErrorResponse(res, messageUtil.unAuthorized);
      let classs = await classServices.getClassDetails({ _id: for_class });
      if (!classs) notFoundResponse(res, messageUtil.NotFound);
      const studentIds = classs.students.map((student) => student._id);
      students = studentIds ?? [];
      let createQuestion = await questionServices.createQuestion({
        ...req.body,
        students: students,
        created_by: req.userId,
      });
      if (students.length > 0)
        for (let i = 0; i < students?.length; i++)
          await userServices.updateUserById(
            { _id: students[i] },
            { $push: { questions_for: createQuestion._id } }
          );
      await userServices.updateUserById(
        { _id: req.userId },
        { $push: { questions_to: createQuestion._id } }
      );
      await classServices.updateClass(
        { _id: for_class },
        { $push: { questions: createQuestion._id } }
      );
      return successResponse(res, messageUtil.createQuestion, createQuestion);
    } catch (error) {
      serverErrorResponse(res, error);
    }
  };
  getQuestion = async (req, res) => {
    const { questionId } = req.params;
    try {
      let question = await questionServices.getQuestionDetails({
        _id: questionId,
      });
      if (!question) notFoundResponse(res, messageUtil.questionsNotFound);
      return successResponse(res, messageUtil.questionFound, question);
    } catch (error) {
      serverErrorResponse(res, error);
    }
  };
  deleteQuestion = async (req, res) => {
    const { questionId } = req.params;
    try {
      let user = await userServices.getUserDetails({
        _id: req.userId,
        isDelete: false,
      });
      if (!user) return notFoundResponse(res, messageUtil.NotFound);
      if (user.userRole === "teacher" || user.userRole === "schoolAdmin") {
        let getQuestion = await questionServices.getQuestionDetails({
          _id: questionId,
        });
        if (!getQuestion) notFoundResponse(res, messageUtil.questionsNotFound);
        let question = await questionServices.updateQuestion(
          { _id: questionId, isActive: true, isDelete: false },
          { isActive: false, isDelete: true }
        );
        for (let i = 0; i < getQuestion?.students?.length; i++)
          await userServices.updateUserById(
            { _id: getQuestion.students[i] },
            { $pull: { questions_for: getQuestion._id } }
          );
        await userServices.updateUserById(
          { _id: getQuestion.created_by },
          { $pull: { questions_to: getQuestion._id } }
        );
        await classServices.updateClass(
          { _id: getQuestion.for_class },
          { $pull: { questions: questionId } }
        );
        return successResponse(res, messageUtil.deleteSuccess, question); //response success msg
      }
      return authorizationErrorResponse(res, messageUtil.unAuthorized);
    } catch (error) {
      serverErrorResponse(res, error); //response error msg
    }
  };
  getAllQuestions = async (req, res) => {
    try {
      const user = await userServices.getUserDetails({
        _id: req.userId,
        isDelete: false,
      });
      if (!user) return notFoundResponse(res, messageUtil.NotFound);
      let object = { isDelete: false, isActive: true };
      if (user.userRole === "teacher") object.created_by = req.userId;
      else if (user.userRole === "student") object.students = req.userId;
      else if (user.userRole === "schoolAdmin") {
      } else return notFoundResponse(res, messageUtil.questionsNotFound);
      const questions = await questionServices.getAllQuestions(object);
      if (questions.length === 0)
        return notFoundResponse(res, messageUtil.questionsNotFound);

      if (user.userRole === "student") {
        const questionsIds = questions?.map((question) => question?._id);

        const submittedAnswers = await Answer.find({
          question: { $in: questionsIds },
          student: req.userId,
        });

        const result = questions.map((question) => {
          // Find the corresponding submitted assignment for this assignment
          const submittedAnswer = submittedAnswers.find(
            (submission) => String(submission.question) === String(question._id)
          );

          // Attach the submitted question (if found) to the question object
          return {
            ...question.toObject(), // Convert the Mongoose document to plain JS object
            submittedAnswer: submittedAnswer || null, // Attach or set null if not found
          };
        });

        return successResponse(res, messageUtil.questionsFound, result);
      } else {
        return successResponse(res, messageUtil.questionsFound, questions);
      }
    } catch (err) {
      serverErrorResponse(res, err);
    }
  };
  getAllAnswers = async (req, res) => {
    try {
      const user = await userServices.getUserDetails({
        _id: req.userId,
        isDelete: false,
      });
      if (!user) return notFoundResponse(res, messageUtil.NotFound);
      let object = { isDelete: false, isActive: true };
      if (user.userRole === "teacher") object.created_by = req.userId;
      else if (user.userRole === "student") object.students = req.userId;
      else if (user.userRole === "schoolAdmin") {
      } else return notFoundResponse(res, messageUtil.questionsNotFound);
      const questions = await questionServices.getAllQuestions(object);
      if (questions.length === 0)
        return successResponse(res, messageUtil.assignmentFound, []);
      const questionsId = questions?.map((question) => question?._id);
      const answers = await Answer.find({ question: { $in: questionsId } })
        .populate("question")
        .populate("student");
      if (answers.length === 0)
        return successResponse(res, messageUtil.assignmentFound, []);
      return successResponse(res, messageUtil.questionsFound, answers);
    } catch (err) {
      serverErrorResponse(res, err);
    }
  };
  updateQuestion = async (req, res) => {
    const { questionId } = req.params;
    try {
      let updatedQuestion = await questionServices.updateQuestion(
        { _id: questionId },
        { ...req.body }
      );
      if (!updatedQuestion)
        return notFoundResponse(res, messageUtil.questionsNotFound);
      return successResponse(res, messageUtil.questionUpdated, updatedQuestion);
    } catch (error) {
      serverErrorResponse(res, error); //response error msg
    }
  };
  markAnswer = async (req, res) => {
    const { answerId, points } = req.body;
    try {
      if (!answerId || !points)
        return res
          .status(400)
          .json({ error: "Answer ID and points are required" });
      const answer = await Answer.findById(answerId);
      if (!answer) return res.status(404).json({ error: "Answer not found" });
      answer.points = points;
      await answer.save();
      return res.status(200).json({ message: "Answer marked successfully" });
    } catch (error) {
      console.log("error :>> ", error);
      return res.status(500).json({ error: "Server error" });
    }
  };
  answerOfQuestion = async (req, res) => {
    const { questionId } = req.params;
    try {
      let updatedQuestion = await questionServices.updateQuestion(
        { _id: questionId },
        { $push: { answers: req.body.answers } }
      );
      if (!updatedQuestion)
        return notFoundResponse(res, messageUtil.questionsNotFound);
      return successResponse(res, messageUtil.answerSubmitted, updatedQuestion);
    } catch (error) {
      serverErrorResponse(res, error); //response error msg
    }
  };
}
module.exports = new Question();
