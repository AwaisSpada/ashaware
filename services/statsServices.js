const UserSchema = require("../Models/user-schema");
const classSchema = require("../Models/class-schema");
const schoolSchema = require("../Models/school-schema");
const districtSchema = require("../Models/district-schema");

//To Get All the Stats of Data (schools,districts,classes,users,teachers,students,districtAdmin,schoolAdmin)
exports.getAllStats = async (query) => {
  let schools = await schoolSchema.countDocuments(query);
  let districts = await districtSchema.countDocuments(query);
  let classes = await classSchema.countDocuments(query);
  let teachers = await UserSchema.countDocuments({
    isDelete: false,
    userRole: "teacher",
  });
  let students = await UserSchema.countDocuments({
    isDelete: false,
    userRole: "student",
  });
  let districtAdmin = await UserSchema.countDocuments({
    isDelete: false,
    userRole: "districtAdmin",
  });
  let schoolAdmin = await UserSchema.countDocuments({
    isDelete: false,
    userRole: "schoolAdmin",
  });
  let users = await UserSchema.countDocuments(query);
  return {
    schools,
    districts,
    classes,
    users,
    teachers,
    students,
    districtAdmin,
    schoolAdmin,
  };
};
