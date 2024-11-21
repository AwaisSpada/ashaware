const classSchema = require("../Models/class-schema");

//To create Class record
exports.createClass = async (query) => {
  return await classSchema.create(query);
};

//To Get Record Of All The Classes
exports.getAllClasses = async (query) => {
  return await classSchema
    .find(query)
    .sort({ _id: -1 })
    .populate("teacher", "-encryptedPassword -__v")
    .populate("students", "-encryptedPassword -__v")
    .populate("lessons", "-__v")
    .populate("school", "-students -teachers -encryptedPassword -__v");
};

//To Get One Record of Class
exports.getClassDetails = async (query) => {
  return await classSchema
    .findOne(query)
    .populate("subject", "-__v")
    .populate("students", "-encryptedPassword -__v")
    .populate("lessons", "-__v")
    .populate("teacher", "-encryptedPassword -__v")
    .populate("assignments", "-__v");
  // .populate("classes", " -students -__v");
};

// To Update the Class record
exports.updateClass = async (query, data) => {
  return await classSchema
    .findOneAndUpdate(query, data, {
      new: true,
    })
    .populate("lessons", "-__v");
  // .select("-__v ");
};
