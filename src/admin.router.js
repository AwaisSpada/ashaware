const { default: AdminBro } = require("admin-bro");
const express = require("express");
const { buildAuthenticatedRouter } = require("admin-bro-expressjs");
const { buildRouter } = require("admin-bro-expressjs");
const bcrypt = require("bcryptjs");
const User = require("../Models/user-schema");
/**
 * @param {AdminBro} admin
 * @return {express.Router} router
 */

const buildAdminRouter = (admin) => {
  const router = buildAuthenticatedRouter(admin, {
    cookieName: "admin-bro",
    cookiePassword: "superlongandcomplicatedname",
    authenticate: async (email, password) => {
      // if (email == "admin@admin.com" && password == "admin") {
      //   // const matched = await bcrypt.compare(password, user.password);
      //   // if (matched) {
      //   return {
      //     email: "admin@admin.com",
      //     password: "admin",
      //   };
      //   // }
      // }
      // return false;

      const adminUser = await User.findOne({ email });
      if (adminUser) {
        const isMatch = await bcrypt.compare(
          password,
          adminUser.encryptedPassword
        );
        if (adminUser && isMatch) {
          return adminUser.toJSON();
        }
        return null;
      }
      return null;
    },
  });
  return router;
};
module.exports = buildAdminRouter;

// {
//   cookieName: "admin-bro",
//   cookiePassword: "superlongandcomplicatedname",
//   authenticate: async (email, password) => {
//     const user = await User.findOne({ email });
//     if (user && (await argon2.verify(user.encryptedPassword, password))) {
//       return user.toJSON();
//     }
//     return null;
//   },
// },
// null,
// {
//   resave: false,
//   saveUninitialized: true,
//   store: new MongoStore({ mongooseConnection: mongoose.connection }),
// }
