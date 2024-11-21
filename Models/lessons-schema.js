const mongoose = require("mongoose");
const LessonsSchema = mongoose.Schema({
  // imageUrl: {
  //   type: String,
  // },
  title: {
    type: String,
  },
  age_group: {
    type: String,
  },
  description: {
    type: String,
  },
  link: {
    type: String,
  },
  assigned_classes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Class",
    default: null,
  },
});
module.exports = mongoose.model("Lessons", LessonsSchema);
