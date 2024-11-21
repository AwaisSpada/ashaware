const mongoose = require("mongoose");
const SchoolSchema = mongoose.Schema({
  schoolName: {
    type: String,
  },
  schoolEmail: {
    type: String,
  },
  schoolPhone: {
    type: String,
  },
  schoolAddress: {
    type: String,
  },
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "District",
    default: null,
  },
  schoolAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  teachers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  students: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  classes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Class",
    default: [],
  },
  isDelete: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  address: {
    type: Object,
    // required: true,
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
  },
});
module.exports = mongoose.model("School", SchoolSchema);
