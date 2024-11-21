const AdminBro = require("admin-bro");
const AdminBroMongoose = require("admin-bro-mongoose");
AdminBro.registerAdapter(AdminBroMongoose);

const AdminUser = require("../src/Users/user.admin");
const District = require("../src/District/district.admin");
const School = require("../src/School/school.admin");
const Class = require("../src/Class/class.admin");
const Subject = require("../Models/subject-schema");
const accounts = require("../Models/accounts-schema");
/* @type {AdminBro.AdminBroOptions}*/
// const locale = {
//   translations: {
//     labels: {
//       // change Heading for Login
//       loginWelcome: "Welcome to AshaWare",
//     },
//     messages: {
//       loginWelcome: "",
//       logo: "",
//     },
//   },
// };
const options = {
  resources: [AdminUser, District, School, Class, Subject, accounts],
  // locale,
  branding: {
    companyName: "Ashaware Admin Panel",
    logo: false,
    softwareBrothers: false,
  },
};
module.exports = options;
