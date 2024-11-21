const mongoose = require("mongoose");
const ClassSchema = mongoose.Schema({
  className: {
    type: String,
    required: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    default: null,
  },
  students: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },

  materials: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Material",
    default: [],
  },

  assignments: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Assignment",
    default: [],
  },

  announcements: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Announcement",
    default: [],
  },

  questions: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Question",
    default: [],
  },

  lessons: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Lessons",
    default: [],
  },

  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
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
module.exports = mongoose.model("Class", ClassSchema);
