const mongoose = require("mongoose");

const SubmittedAssignmentSchema = mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  file_url: {
    type: String,
    required: true,
  },
  submitted_at: {
    type: Date,
    default: Date.now,
  },
  points: {
    type: Number,
    required: true,
    default: 0,
  },
});

SubmittedAssignmentSchema.index(
  {
    assignment: 1,
    student: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "SubmittedAssignment",
  SubmittedAssignmentSchema
);
