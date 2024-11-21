const UserSchema = require("../Models/user-schema");

//To create User record
exports.createUser = async (query) => {
  return await UserSchema.create(query);
};

//To Get One Record of User
exports.getUser = async (query) => {
  return await UserSchema.findOne(query);
};

//To Get One Record of User
exports.getUserDetails = async (query) => {
  return await UserSchema.findOne(query).select(
    "-__v -createdAt -updatedAt -password -emailVerify"
  );
};

//To Update the User
exports.updateUserById = async (query, data) => {
  return await UserSchema.findOneAndUpdate(query, data, {
    new: true,
  }).select("-__v -createdAt -updatedAt");
};

//To Get Record Of All Users
exports.getAllUsers = async (query) => {
  return await UserSchema.find(query).sort({ _id: -1 });
};

//To Get Record Of All users whose Role is "Teacher"
exports.getAllTeachers = async (query) => {
  return await UserSchema.find(query).sort({ _id: -1 });
};
/////
exports.getAllStudents = async (query) => {
  return await UserSchema.find(query).sort({ _id: -1 });
};
///To Get All District Users
exports.AllDistrictUsers = async (query) => {
  return await UserSchema.find(query).sort({ _id: -1 });
};
