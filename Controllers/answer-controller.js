const Question = require("../Models/question-schema");
const SubmittedAnswer = require("../Models/submitted-answer");
const { badRequestErrorResponse } = require("../utilities/response");

class Answer {
  async submitAnswer(req, res) {
    const { questionId, studentId, answer } = req.body;

    if (!questionId || !studentId || !answer) {
      throw badRequestErrorResponse(res, "Missing Fields");
    }

    try {
      // Check if question exists

      const question = await Question.findById(questionId);

      if (!question) {
        return res.status(404).json({
          error: "Question not found",
        });
      }

      // Check if the student has already submitted

      const existingSubmission = await SubmittedAnswer.findOne({
        question: questionId,
        student: studentId,
      });

      if (existingSubmission) {
        return res.status(400).json({
          error: "You have Already Answered to this question",
        });
      }

      // Create a new submission

      const newSubmission = new SubmittedAnswer({
        question: questionId,
        student: studentId,
        answer: answer,
      });

      await newSubmission.save();

      return res.status(201).json({
        message: "Answer submitted successfully",
      });
    } catch (error) {
      console.log("error :>> ", error);
      return res.status(500).json({
        error: "Server error",
      });
    }
  }
}

module.exports = new Answer();
