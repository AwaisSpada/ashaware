const UserSchema = require("../Models/user-schema");
const schoolSchema = require("../Models/school-schema");
const districtSchema = require("../Models/district-schema");
const classSchema = require("../Models/class-schema");
const subjectSchema = require("../Models/subject-schema");

//To Get All the Data (schools,districts,classes,users)
exports.getAllData = async (query) => {
  return {
    schools: await schoolSchema.find({
      isDelete: false,
    }),
    districts: await districtSchema.find({
      isDelete: false,
    }),
    classes: await classSchema.find({
      isDelete: false,
    }),
    users: await UserSchema.find(query),
    subjects: await subjectSchema.find({
      isDelete: false,
    }),
  };
};
//////////DistrictAllRecord Service/////////
//To Get  All users,subjects,classes,schools
exports.getAllDistrictData = async (query, districtId) => {
  return {
    classes: await classSchema.find({
      isDelete: false,
    }),
    users: await UserSchema.find(query),
    subjects: await subjectSchema.find(),
    schools: await schoolSchema.find({
      ...districtId,
      isDelete: false,
    }),
  };
};
/****************************************/
exports.getAllSchoolData = async (query) => {
  return {
    // classes: await classSchema.find({
    //   isDelete: false,
    // }),
    users: await UserSchema.find(query),
    subjects: await subjectSchema.find(),
  };
};
