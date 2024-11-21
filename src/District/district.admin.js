const District = require("../../Models/district-schema");

/*{AdminBro.ResourceOptions} */
const options = {
  listProperties: ["districtName", "districtAdmin", "isActive", "schools"],
  actions: {},
};
module.exports = {
  options,
  resource: District,
};
