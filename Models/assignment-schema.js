const mongoose = require("mongoose");
const AssignmentSchema = mongoose.Schema({
  due_date: {
    type: String,
    required: true,
  },

  title: {
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

  topic: {
    type: String,
    required: false,
  },

  for_class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    default: null,
  },

  lesson_url: {
    type: String,
    required: true,
  },

  students: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },

  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    default: null,
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

module.exports = mongoose.model("Assignment", AssignmentSchema);
