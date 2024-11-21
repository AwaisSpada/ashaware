const mongoose = require("mongoose");
const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  encryptedPassword: {
    type: String,
    required: true,
  },
  userRole: {
    type: String,
    enum: ["superAdmin", "districtAdmin", "schoolAdmin", "teacher", "student"],
    required: true,
  },
  isDelete: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },

  emailVerifyToken: String,
  emailExpireToken: String,
  resetToken: String,
  emailVerify: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    // required: true,
  },

  assignment_to: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Assignment",
    default: [],
  },

  assignment_for: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Assignment",
    default: [],
  },

  questions_to: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Question",
    default: [],
  },

  questions_for: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Question",
    default: [],
  },

  announcement_to: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Announcement",
    default: [],
  },

  announcement_for: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Announcement",
    default: [],
  },

  material_to: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Material",
    default: [],
  },

  material_for: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Material",
    default: [],
  },

  assigned_classes: {
    type: Array,
    default: [],
  },
});
module.exports = mongoose.model("User", UserSchema);
