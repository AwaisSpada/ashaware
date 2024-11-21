const School = require("../../Models/school-schema");

/*{AdminBro.ResourceOptions} */
const options = {
  listProperties: [
    "schoolName",
    "schoolEmail",
    "district",
    "teachers",
    "students",
    "classes",
  ],
  actions: {},
};
module.exports = {
  options,
  resource: School,
};
