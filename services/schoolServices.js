const schoolSchema = require("../Models/school-schema");

//To create School record
exports.createSchool = async (query) => {
  return await schoolSchema.create(query);
};

//To Get Record Of All Schools
exports.getAllSchools = async (query) => {
  return await schoolSchema
    .find(query)
    .sort({ _id: -1 })
    .populate("teachers", "-encryptedPassword -__v")
    .populate("classes", "-school -students -__v")
    .populate("students", "-encryptedPassword -__v")
    .populate("schoolAdmin", "-encryptedPassword -__v");
};

//To Get One Record of School
exports.getSchoolDetails = async (query) => {
  let select = {
    district: 0,
    emailVerify: 0,
    emailExpireToken: 0,
    emailVerifyToken: 0,
    __v: 0,
    isDelete: 0,
    isActive: 0,
    encryptedPassword: 0,
    school: 0,
  };

  return await schoolSchema
    .findOne(query)
    .populate({
      path: "classes",
      populate: [
        {
          path: "teacher",
          model: "User",
          select: select,
        },
        {
          path: "Subject",
          model: "Subject",
          select: select,
        },
      ],
    })
    .populate("schoolAdmin", "-encryptedPassword -__v")
    .populate("district", "-encryptedPassword -__v")
    .populate({
      path: "teachers",
      match: { isDelete: { $ne: true } },
      select: { encryptedPassword: 0, __v: 0 },
    })
    .populate({
      path: "students",
      match: { isDelete: { $ne: true } },
      select: { encryptedPassword: 0, __v: 0 },
    })
    .populate("accountId", "-__v");
};

//To Update the School record
exports.updateSchool = async (query, data) => {
  return await schoolSchema
    .findOneAndUpdate(query, data, {
      new: true,
    })
    .select("-__v ");
};
