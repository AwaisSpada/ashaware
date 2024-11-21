const Class = require("../../Models/class-schema");
/*{AdminBro.ResourceOptions} */
const options = {
  listProperties: ["className", "students", "teacher"],
  actions: {},
};
module.exports = {
  options,
  resource: Class,
};
