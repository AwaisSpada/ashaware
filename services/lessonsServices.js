const LessonsSchema = require("../Models/lessons-schema");

//To create lessons record
exports.createLessons = async (query) => {
  return await LessonsSchema.create(query);
};

//To Get One Record of Lessons
exports.getLessons = async (query) => {
  return await LessonsSchema.findOne(query)

    .populate({
      path: "assigned_classes",
      populate: {
        path: "teacher",
        model: "User",
      },
    })
    .populate({
      path: "assigned_classes",
      populate: {
        path: "school",
        model: "School",
      },
    })
    .populate({
      path: "assigned_classes",
      populate: [
        {
          path: "teacher",
          model: "User",
        },
        {
          path: "students",
          model: "User",
        },
        {
          path: "school",
          model: "School",
        },
        {
          path: "subject",
          model: "Subject",
        },
      ],
    });
};

//To Update the lessons
exports.updateLessonsById = async (query, data) => {
  return await LessonsSchema.findOneAndUpdate(query, data, {
    new: true,
  }).select("-__v -createdAt -updatedAt");
};

//To Get Record Of All lessons
exports.getAllLessons = async (query) => {
  return await LessonsSchema.find(query)
    .sort({ _id: -1 })
    .populate("assigned_classes");
};

exports.deleteLessons = async (query) => {
  return await LessonsSchema.findOneAndRemove(query);
};
