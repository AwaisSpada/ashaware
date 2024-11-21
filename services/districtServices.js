const districtSchema = require("../Models/district-schema");
//To create Distrcit record
exports.createDistrict = async (query) => {
  return await districtSchema.create(query);
};

//Get All Districts
exports.getAllDistrict = async (query) => {
  return await districtSchema
    .find(query)
    .sort({ _id: -1 })
    .populate("schools", "-district -__v")
    .populate("districtAdmin", "-encryptedPassword -__v");
};

//To Get One Record of Distrcit
exports.getDistrictDetails = async (query) => {
  let select = {
    district: 0,
    emailVerify: 0,
    emailExpireToken: 0,
    emailVerifyToken: 0,
    __v: 0,
    isActive: 0,
    encryptedPassword: 0,
  };

  return await districtSchema
    .findOne(query)
    .populate({
      path: "schools",
      populate: [
        {
          path: "teachers",
          model: "User",
          select: select,
        },
        {
          path: "students",
          model: "User",
          select: select,
        },
        {
          path: "schoolAdmin",
          model: "User",
          select: select,
        },
        {
          path: "classes",
          model: "Class",
        },
      ],
    })
    .populate("districtAdmin", " -isDelete -encryptedPassword -__v");
};

//To Update the District record
exports.updateDistrict = async (query, data) => {
  return await districtSchema
    .findOneAndUpdate(query, data, {
      new: true,
    })
    .select("-__v ");
};
