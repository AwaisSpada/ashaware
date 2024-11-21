const AdminBro = require("admin-bro");
const User = require("../../Models/user-schema");
const bcrypt = require("bcryptjs");
// const argon2 = require("argon2");
const options = {
  // properties: {
  //   isDelete: {
  //     isVisible: false,
  //   },
  //   encryptedPassword: {
  //     isVisible: false,
  //   },
  //   password: {
  //     type: "password",
  //   },
  // },
  listProperties: ["name", "email", "userRole", "isDelete", "emailVerify"],
  actions: {
    new: {
      after: async (response) => {
        if (response.record && response.record.errors) {
          response.record.errors.password =
            response.record.errors.encryptedPassword;
        }
        return response;
      },
      before: async (request) => {
        if (request.method === "post") {
          const { password, ...otherParams } = request.payload;

          if (password) {
            let salt = await bcrypt.genSalt(10);
            const encryptedPassword = await bcrypt.hash(password, salt);
            return {
              ...request,
              payload: {
                ...otherParams,
                encryptedPassword,
              },
            };
          }
        }
        return request;
      },
    },
  },
};
module.exports = {
  options,
  resource: User,
};
