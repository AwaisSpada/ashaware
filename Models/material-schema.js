const mongoose = require("mongoose");
const MaterialSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: false,
  },

  topic: {
    type: String,
    required: true,
  },

  lesson_url: {
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

  isActive: {
    type: Boolean,
    default: true,
  },

  isDelete: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Material", MaterialSchema);
