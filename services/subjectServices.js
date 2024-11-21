const subjectSchema = require("../Models/subject-schema");

//To Create Subject record
exports.addSubject = async (query) => {
  return await subjectSchema.create(query);
};
exports.getAllSubjects = async (query) => {
  return await subjectSchema.find(query).sort({ _id: -1 });
};
exports.updateSubject = async (query, data) => {
  return await subjectSchema
    .findOneAndUpdate(query, data, {
      new: true,
    })
    .select("-__v ");
};
//To Get One Record of User
exports.getSubjectDetails = async (query) => {
  return await subjectSchema.findOne(query);
};
