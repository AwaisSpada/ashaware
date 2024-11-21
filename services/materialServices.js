const materialSchema = require("../Models/material-schema");

//To create Material record
exports.createMaterial = async (query) => {
  return await materialSchema.create(query);
};

//To Get Record Of All The Material
exports.getAllMaterials = async (query) => {
  return await materialSchema.find(query).sort({ _id: -1 });
};

//To Get One Record of Material
exports.getMaterialDetails = async (query) => {
  return await materialSchema.findOne(query);
};

// To Update the Material record
exports.updateMaterial = async (query, data) => {
  return await materialSchema.findOneAndUpdate(query, data, {
    new: true,
  });
};
