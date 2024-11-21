const mongoose = require("mongoose");
const AnnouncementSchema = mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },

    for_class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      default: null,
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

    lesson_url: {
      type: String,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Add timestamps (createdAt and updatedAt)
  }
);

module.exports = mongoose.model("Announcement", AnnouncementSchema);
