const mongoose = require("mongoose");

const SubmittedAnswerSchema = mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  submitted_at: {
    type: Date,
    default: Date.now,
  },

  points: {
    type: Number,
    required: false,
    deafult: 0,
  },
});

SubmittedAnswerSchema.index(
  {
    question: 1,
    student: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("SubmittedAnswer", SubmittedAnswerSchema);
