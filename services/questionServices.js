const questionSchema = require("../Models/question-schema");

//To create Question record
exports.createQuestion = async (query) => {
  return await questionSchema.create(query);
};

//To Get Record Of All The Question
exports.getAllQuestions = async (query) => {
  return await questionSchema
    .find(query)
    .sort({ _id: -1 })
    .populate("for_class", "-encryptedPassword -__v");
};

//To Get One Record of Question
exports.getQuestionDetails = async (query) => {
  return await questionSchema
    .findOne(query)
    .populate("for_class", "-encryptedPassword -__v")
    .populate("students", "-__v");
};

// To Update the Question record
exports.updateQuestion = async (query, data) => {
  return await questionSchema.findOneAndUpdate(query, data, {
    new: true,
  });
};
