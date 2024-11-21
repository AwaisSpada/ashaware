const mongoose = require("mongoose");
const QuestionSchema = mongoose.Schema({
  due_date: {
    type: String,
    required: true,
  },

  question: {
    type: String,
    required: true,
  },

  instruction: {
    type: String,
    required: false,
  },

  points: {
    type: Number,
    required: true,
  },

  lesson_url: {
    type: String,
    required: true,
  },

  options: {
    type: Array,
    required: false,
  },

  answers: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      answer: {
        type: String,
        required: false,
      },
    },
  ],

  type: {
    type: String,
    enum: ["short-answer", "multiple-choice"],
    default: "short-answer",
  },

  for_class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    default: null,
  },

  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  students: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  isDelete: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Question", QuestionSchema);
