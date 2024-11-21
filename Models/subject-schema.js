const mongoose = require("mongoose");
const SubjectSchema = mongoose.Schema({
  subjectName: {
    type: String,
  },
  isDelete: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});
module.exports = mongoose.model("Subject", SubjectSchema);
