const assignmentSchema = require("../Models/assignment-schema");

//To create Assignment record
exports.createAssignment = async (query) => {
  return await assignmentSchema.create(query);
};

//To Get Record Of All The Assignment
exports.getAllAssignments = async (query) => {
  return await assignmentSchema
    .find(query)
    .sort({ _id: -1 })
    .populate("for_class", "-encryptedPassword -__v")
    .populate("lesson", "-__v");
};

//To Get One Record of Assignment
exports.getAssignmentDetails = async (query) => {
  return await assignmentSchema
    .findOne(query)
    .populate("for_class", "-encryptedPassword -__v")
    .populate("students", "-__v");
};

// To Update the Assignment record
exports.updateAssignment = async (query, data) => {
  return await assignmentSchema.findOneAndUpdate(query, data, {
    new: true,
  });
};
