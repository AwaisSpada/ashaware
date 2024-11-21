const UserSchema = require("../Models/user-schema");
const UserServices = require("../services/userServices");
const schoolServices = require("../services/schoolServices");
const allDataServices = require("../services/allDataServices");
const districtServices = require("../services/districtServices");

const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const fetch = require("node-fetch");
const { customAlphabet } = require("nanoid");
const jwtHelper = require("../Middlewares/jwt");
const messageUtil = require("../utilities/message");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.googleClientId);
const { emailSender } = require("../utilities/emailSender");
const { emailResetToken } = require("../utilities/emailResetToken");
const { emailVerification } = require("../utilities/emailVerification");

const {
  successResponse,
  existAlreadyResponse,
  badRequestErrorResponse,
  notFoundResponse,
  authorizationErrorResponse,
  serverErrorResponse,
} = require("../utilities/response");

class User {
  AddUser = async (req, res) => {
    //destruct data from body
    const { name, email, encryptedPassword, userRole } = req.body;
    let errors = [];

    //check required fileds
    if (!name) {
      errors.push("name");
    }
    if (!email) {
      errors.push("Email");
    }
    if (!encryptedPassword) {
      errors.push("encryptedPassword");
    }
    if (!userRole) {
      errors.push("userRole");
    }
    if (errors.length > 0) {
      errors = errors.join(", ");
      return badRequestErrorResponse(res, `Please insert: ${errors}`);
    }
    try {
      //find user
      let user = await UserServices.getUser({
        email,
        // isActive: true,
        isDelete: false,
      });

      //return if user already exist
      if (user) {
        return existAlreadyResponse(res, messageUtil.emailAlreadyExist);
      }

      //create user
      user = await UserServices.createUser({
        ...req.body,
      });

      // send verification email
      let verify = emailVerification(user);
      await emailSender(
        req.body.email,
        "muhammadshahzad07618@gmail.com",
        verify.subject,
        verify.html
      );

      //password encryption
      let salt = await bcrypt.genSalt(10);
      user.encryptedPassword = await bcrypt.hash(encryptedPassword, salt);

      //Generate Token
      const buffer = crypto.randomBytes(4);
      const token = buffer.toString("hex");
      user.emailVerifyToken = token;
      user.emailExpireToken = Date.now() + 3.6e6;

      //save user with encrypted password
      await user.save();

      //responses
      return successResponse(res, messageUtil.userRegister, user); //response success msg
    } catch (error) {
      return serverErrorResponse(res, error); //response error msg
    }
  };

  Login = async (req, res) => {
    //destruct data from body
    const { email, encryptedPassword } = req.body;
    let errors = [];

    //check required fileds
    if (!email) {
      errors.push("Email");
    }
    if (!encryptedPassword) {
      errors.push("encryptedPassword");
    }
    if (errors.length > 0) {
      errors = errors.join(",");
      return badRequestErrorResponse(res, `Please insert: ${errors}`);
    }
    try {
      //find user
      let user = await UserServices.getUser({ email, isActive: true });

      //return if user already exist
      if (!user) {
        notFoundResponse(res, messageUtil.NotFound);
      }

      //email verify check
      //return if email is not verified
      // if (!user.emailVerify) {
      //   notFoundResponse(res, messageUtil.notVerified);
      // }

      //compare password
      const isMatch = await bcrypt.compare(
        encryptedPassword,
        user.encryptedPassword
      );

      //return if user Enter wrong password
      if (!isMatch) {
        authorizationErrorResponse(res, messageUtil.incorrectPassword);
      }

      //isuee token againt user login
      const token = jwtHelper.issue({ id: user._id, role: user.userRole });

      //responses
      successResponse(res, messageUtil.ok, user, token); //Response Success Msg
    } catch (error) {
      serverErrorResponse(res, error); //Response Error msg
    }
  };

  districtAdminLogin = async (req, res) => {
    //destruct data from body
    const { email, encryptedPassword } = req.body;
    let errors = [];

    //check required fileds
    if (!email) {
      errors.push("Email");
    }
    if (!encryptedPassword) {
      errors.push("encryptedPassword");
    }
    if (errors.length > 0) {
      errors = errors.join(",");
      return badRequestErrorResponse(res, `Please insert: ${errors}`);
    }
    try {
      //find user
      let user = await UserServices.getUser({ email, isActive: true }); //isActive: true

      //return if user not exists
      if (!user) {
        return notFoundResponse(res, messageUtil.NotFound);
      }

      //return if user Role is not DistrictAdmin
      if (user.userRole !== "districtAdmin") {
        return notFoundResponse(res, messageUtil.notEligible);
      }

      //return if email is not verified
      // if (!user.emailVerify) {
      //   notFoundResponse(res, messageUtil.notVerified);
      // }

      //compare password
      const isMatch = await bcrypt.compare(
        encryptedPassword,
        user.encryptedPassword
      );

      //return if user Enter wrong password
      if (!isMatch) {
        authorizationErrorResponse(res, messageUtil.incorrectPassword); //Response incorrect password msg
      }

      //isuee token againt user login
      const token = jwtHelper.issue({ id: user._id, role: user.userRole });

      //responses
      successResponse(res, messageUtil.ok, user, token); //Response Success Msg
    } catch (error) {
      serverErrorResponse(res, error); //Response Error msg
    }
  };

  UserAuth = async (req, res) => {
    let user;
    try {
      //find user
      user = await UserServices.getUser({ _id: req.userId });

      //return if usernot found
      if (!user) {
        notFoundResponse(res, messageUtil.NotFound);
      }

      //responses
      successResponse(res, messageUtil.ok, user);
    } catch (err) {
      serverErrorResponse(res, err);
    }
  };

  GetUserById = async (req, res) => {
    const { userId } = req.params;
    let user;
    try {
      //find user
      user = await UserServices.getUserDetails({
        _id: userId,
        isDelete: false,
        isActive: true,
      });

      //return if user not found
      if (!user) {
        notFoundResponse(res, messageUtil.NotFound); //response msg
      }

      //responses
      successResponse(res, messageUtil.ok, user); //response success msg
    } catch (error) {
      serverErrorResponse(res, error); //response error msg
    }
  };

  GetAllUsers = async (req, res) => {
    try {
      //find all users
      let user = await UserServices.getAllUsers({
        isDelete: false,
      });

      //return if users not found
      if (user.length < 1) {
        notFoundResponse(res, messageUtil.NotFound);
      }

      //responses
      successResponse(res, messageUtil.ok, user); //response success msg
    } catch (err) {
      serverErrorResponse(res, err); //response error msg
    }
  };

  updateUserById = async (req, res) => {
    const { userId } = req.params;
    let user;
    try {
      //if body contains password then update password
      if (req.body.encryptedPassword) {
        let salt = await bcrypt.genSalt(10);
        req.body.encryptedPassword = await bcrypt.hash(
          req.body.encryptedPassword,
          salt
        );
      }

      //update user
      user = await UserServices.updateUserById(
        { _id: userId },
        { ...req.body }
      );

      //return if user not found
      if (!user) {
        return notFoundResponse(res, messageUtil.NotFound);
      }

      //responses
      return successResponse(res, messageUtil.updateSuccess, user);
    } catch (err) {
      return serverErrorResponse(res, err);
    }
  };

  GetAllTeachers = async (req, res) => {
    let user;
    try {
      //find all teachers
      user = await UserServices.getAllTeachers({
        userRole: "teacher",
        isDelete: false,
      });

      //return if no teacher found
      if (user.length < 1) {
        notFoundResponse(res, messageUtil.NotFound);
      }

      //responses
      successResponse(res, messageUtil.teachersFound, user); //response success msg
    } catch (err) {
      serverErrorResponse(res, err); //response error msg
    }
  };

  getAllStudents = async (req, res) => {
    let user;
    try {
      //find all students
      user = await UserServices.getAllStudents({
        userRole: "student",
        isDelete: false,
      });

      //return if no student found
      if (user.length < 1) {
        notFoundResponse(res, messageUtil.NotFound);
      }

      //responses
      successResponse(res, messageUtil.studentsFound, user); //response success msg
    } catch (err) {
      serverErrorResponse(res, err); //response error msg
    }
  };

  Invitation = async (req, res) => {
    //destruct data from body
    const { email, subject, message } = req.body;
    let user;
    try {
      //find user
      user = await UserServices.getUserDetails({
        email,
        isActive: true,
        // emailVerify: true,
        isDelete: false,
      });

      //response if record already exist
      if (user) {
        successResponse(res, messageUtil.recordAlreadyExist, user); //response msg
      }

      //send mail
      var to = email;
      var from = "umarbaig1998@gmail.com";
      var html = `<h3>Hi,</h3>
        <h4>Congratulations!<br>${message}.<br>
        Please click on the <a href="http://localhost:3633/detailPage">link</a> to register yourself.<br>Thank You</h4>.`;
      mailer.emailSender(to, from, subject, html);

      //responses
      successResponse(res, messageUtil.invitationSent, user); //response msg
    } catch (err) {
      serverErrorResponse(res, err); //response msg
    }
  };

  RemoveUserById = async (req, res) => {
    const { id } = req.params;
    try {
      //find user and update delete status
      let user = await UserServices.updateUserById(
        { _id: id, isActive: true, isDelete: false },
        { isActive: false, isDelete: true }
      );

      //responses
      successResponse(res, messageUtil.deleteSuccess, user); //response success msg
    } catch (err) {
      serverErrorResponse(res, err); //response error msg
    }
  };

  ///////////Email Verify/////////
  GenerateEmailToken = async (req, res) => {
    //destruct data from body
    const { email } = req.body;
    try {
      //find user
      let user = await UserServices.getUserDetails({
        email,
        isActive: true,
        isDelete: false,
      });
      //return if not found
      if (!user) {
        notFoundResponse(res, messageUtil.NotFound); //response msg
      }
      //send email token
      const buffer = crypto.randomBytes(4);
      const token = buffer.toString("hex");
      user.emailVerifyToken = token;
      user.emailExpireToken = Date.now() + 3.6e6;
      await user.save();

      var to = user.email;
      var from = "umarbaig1998@gmail.com";
      var subject = "Email Verification Token";
      var html = `<p>You requested for the email verification</p>
           <h3> Your Code is : ${user.emailVerifyToken} </h3>`;

      mailer.emailSender(to, from, subject, html);

      //responses
      successResponse(res, messageUtil.mailSent); //response success msg
    } catch (error) {
      serverErrorResponse(res, error); //response error msg
    }
  };
  ////////////////////////////
  VerifyEmail = async (req, res) => {
    //destruct data from body
    const { sentToken } = req.body;

    try {
      //find user
      const user = await UserServices.getUserDetails({
        emailVerifyToken: sentToken,
        isActive: true,
        isDelete: false,
        emailExpireToken: { $gt: Date.now() },
      });

      //return if session expired
      if (!user) {
        notFoundResponse(res, messageUtil.sessionExpired); //response msg
      }
      user.emailVerifyToken = undefined;
      user.emailExpireToken = undefined;
      user.emailVerify = true;

      //save user
      await user.save();

      //responses
      successResponse(res, messageUtil.emailVerify); //response msg
    } catch (error) {
      serverErrorResponse(res, error); //response msg
    }
  };

  //////////////////
  DistrictAdminGoogleLogin = async (req, res) => {
    //destruct data from body
    const { tokenId } = req.body;
    client
      .verifyIdToken({
        idToken: tokenId,
        audience: process.env.googleClientId,
      })
      .then(async (response) => {
        const { given_name, family_name, email, email_verified, picture } =
          response.payload;
        if (email_verified) {
          //find user
          const user = await UserServices.getUserDetails({
            //Funct:Call Service
            email,
            userRole: "districtAdmin",
            isDelete: false,
          });
          //if user found
          if (user) {
            // send token
            var password1 = email + process.env.jwtSecret;
            try {
              const isMatch = await bcrypt.compare(
                password1,
                user.encryptedPassword
              );
              //return if password not match
              if (!isMatch) {
                authorizationErrorResponse(res, messageUtil.incorrectPassword); //response msg
              } else {
                const token = jwtHelper.issue({
                  id: user._id,
                  role: user.userRole,
                });
                successResponse(res, messageUtil.ok, user, token); //response msg
              }
            } catch (error) {
              serverErrorResponse(res, error); //response msg
            }
          } else {
            var password1 = email + process.env.jwtSecret;
            let salt = await bcrypt.genSalt(10);
            let encryptedPassword = await bcrypt.hash(password1, salt);
            let newUser = new UserSchema({
              email,
              name: given_name.concat(family_name),
              encryptedPassword,
              userRole: "districtAdmin",
            });
            //save the user
            await newUser.save();

            try {
              //compare password
              const isMatch = await bcrypt.compare(
                password1,
                newUser.encryptedPassword
              );
              //return if password not match
              if (!isMatch) {
                authorizationErrorResponse(res, messageUtil.incorrectPassword); //response msg
              } else {
                const token = jwtHelper.issue({
                  id: newUser._id,
                  role: newUser.userRole,
                });
                successResponse(res, messageUtil.ok, newUser, token); //response msg
              }
            } catch (error) {
              serverErrorResponse(res, error); //response msg
            }
          }
        }
      });
  };

  ////////////////
  DistrictAdminFacebookLogin = async (req, res) => {
    //destruct data from body
    const { userID, accessToken } = req.body;
    let urlGraphFacebook = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;
    fetch(urlGraphFacebook, {
      method: "GET",
    })
      .then((response) => response.json())
      // .then(async (res) => {
      .then(async (response) => {
        const { email, name } = response;
        //find user
        const user = await UserServices.getUserDetails({
          email,
          userRole: "districtAdmin",
          isDelete: false,
        });
        if (user) {
          // send token only
          var password1 = email + process.env.jwtSecret;
          try {
            //compare password
            const isMatch = await bcrypt.compare(
              password1,
              user.encryptedPassword
            );
            //return if password not match
            if (!isMatch) {
              authorizationErrorResponse(res, messageUtil.incorrectPassword); //response msg
            } else {
              const token = jwtHelper.issue({
                id: user._id,
                role: user.userRole,
              });
              console.log({ token });
              successResponse(res, messageUtil.ok, user, token); //response msg
            }
          } catch (error) {
            serverErrorResponse(res, error); //response msg
          }
        } else {
          let salt = await bcrypt.genSalt(10);
          var password1 = email + process.env.jwtSecret;
          let encryptedPassword = await bcrypt.hash(password1, salt);
          let newUser = new UserSchema({
            name,
            email,
            encryptedPassword,
            userRole: "districtAdmin",
          });
          //save user
          await newUser.save();

          try {
            //comapre password
            const isMatch = await bcrypt.compare(
              password1,
              newUser.encryptedPassword
            );
            //return if password is incorrect
            if (!isMatch) {
              authorizationErrorResponse(res, messageUtil.incorrectPassword); //response msg
            }
            const token = jwtHelper.issue({
              id: newUser._id,
              role: newUser.userRole,
            });
            successResponse(res, messageUtil.ok, newUser, token); //response msg
          } catch (error) {
            serverErrorResponse(res, error); //response msg
          }
        }
      });
  };
  ////////////////

  getAllModelsData = async (req, res) => {
    try {
      //find All Records of School.District,User,Class, subject
      let allData = await allDataServices.getAllData({
        userRole: req.body.userRole,
        isDelete: false,
        // isActive: true,
      });

      //return if not found
      if (!allData) {
        notFoundResponse(res, messageUtil.NotFound);
      }

      //responses
      return successResponse(res, messageUtil.ok, allData);
    } catch (error) {
      serverErrorResponse(res, error); //response Error Msg
    }
  };

  schoolsByDistrictAdmin = async (req, res) => {
    try {
      //find district
      let district = await districtServices.getDistrictDetails({
        districtAdmin: req.userId,
        isDelete: false,
        isActive: true,
      });

      //return if not found
      if (!district) {
        return badRequestErrorResponse(res, messageUtil.NotFound);
      }

      //find all schools
      let school = await schoolServices.getAllSchools({
        district: district._id,
        isActive: true,
        isDelete: false,
      });

      //return if schools not found
      if (school.length === 0) {
        notFoundResponse(res, messageUtil.NotFound);
      }

      //responses
      successResponse(res, messageUtil.ok, school); //response success msg
    } catch (err) {
      serverErrorResponse(res, err); //response Error Msg
    }
  };

  schoolUserCreation = async (req, res) => {
    //destruct data from body
    const { name, email, encryptedPassword, userRole } = req.body;
    let errors = [];

    //check required fileds
    if (!name) {
      errors.push("name");
    }
    if (!email) {
      errors.push("Email");
    }
    if (!encryptedPassword) {
      errors.push("encryptedPassword");
    }
    if (!userRole) {
      errors.push("userRole");
    }
    if (errors.length > 0) {
      errors = errors.join(", ");
      return badRequestErrorResponse(res, `Please insert: ${errors}`);
    }
    try {
      // //find school
      // let school = await schoolServices.getSchoolDetails({
      //   schoolAdmin: req.userId,
      //   isDelete: false,
      // });
      // console.log("schoolAdmin", req.userId);
      // //return if not found
      // if (!school) {
      //   return badRequestErrorResponse(res, messageUtil.NotFound);
      // }
      // console.log("school", school);

      // find school

      let user = await UserServices.getUserDetails({
        _id: req.userId,
        isDelete: false,
      });

      // Return if user not found
      if (!user) {
        return notFoundResponse(res, messageUtil.NotFound);
      }
      // console.log("user", user);
      let school;

      if (user.userRole === "teacher" || user.userRole === "schoolAdmin") {
        // If the user is a teacher or schoolAdmin, find the school associated with them
        const schoolQuery = {
          $or: [{ teachers: req.userId }, { schoolAdmin: req.userId }],
          //  schoolEmail: req.body.school,
          isDelete: false,
          isActive: true,
        };
        school = await schoolServices.getSchoolDetails(schoolQuery);
      }

      // Return if school not found
      if (!school) {
        return notFoundResponse(res, messageUtil.schoolNotFound);
      }
      // console.log("school", school);

      //find user
      user = await UserServices.getUser({
        email,
        isDelete: false,
      });

      //return if user already exist
      if (user) {
        return existAlreadyResponse(res, messageUtil.emailAlreadyExist);
      }

      //create user
      user = await UserServices.createUser({
        ...req.body,
      });

      //password encryption
      let salt = await bcrypt.genSalt(10);
      user.encryptedPassword = await bcrypt.hash(encryptedPassword, salt);
      const buffer = crypto.randomBytes(4);
      const token = buffer.toString("hex");
      user.emailVerifyToken = token;
      user.emailExpireToken = Date.now() + 3.6e6;

      // send verification email
      let verify = emailVerification(user);
      await emailSender(
        req.body.email,
        "muhammadshahzad07618@gmail.com",
        verify.subject,
        verify.html
      );

      //save user with encrypted password
      await user.save();

      //update school
      if (req.body.userRole === "student") {
        await schoolServices.updateSchool(
          {
            _id: school._id,
          },
          {
            $push: { students: user._id },
          }
        );
      } else {
        await schoolServices.updateSchool(
          {
            _id: school._id,
          },
          {
            $push: { teachers: user._id },
          }
        );
      }

      //responses
      return successResponse(res, messageUtil.userRegister, user); //response success msg
    } catch (error) {
      return serverErrorResponse(res, error); //response error msg
    }
  };

  forgetPasswordEmail = async (req, res) => {
    const { email } = req.body;
    try {
      //find user
      let user = await UserServices.getUser({
        email,
        // isActive: true,
        isDelete: false,
      });

      //return if user not exist
      if (!user) {
        return notFoundResponse(res, messageUtil.userNotExist);
      }

      //Generate Token
      const nanoid = customAlphabet("1234567890", 5);
      const token = nanoid();
      user.resetToken = token;
      user.emailExpireToken = Date.now() + 600000; //expirey of token
      // console.log("emailVerificationToken :", user.resetToken);

      // send verification email
      let verify = emailResetToken(user);
      await emailSender(
        req.body.email,
        "muhammadshahzad07618@gmail.com",
        verify.subject,
        verify.html
      );

      //update user with reset token and expire token
      user = await UserServices.updateUserById(
        { _id: user._id },
        { resetToken: token, emailExpireToken: Date.now() + 600000 }
      );

      //responses
      return successResponse(res, messageUtil.resetCode); //response success msg
    } catch (error) {
      return serverErrorResponse(res, error); //response error msg
    }
  };
  forgetPasswordCheck = async (req, res) => {
    //destruct
    const { email, resetToken } = req.body;
    try {
      //find user
      let user = await UserServices.getUser({
        resetToken,
        email,
        isDelete: false,
      });

      //return if user not exist
      if (!user) {
        return notFoundResponse(res, messageUtil.userNotExist);
      }

      // if body contains password then encrypt password
      if (req.body.encryptedPassword) {
        let salt = await bcrypt.genSalt(10);
        req.body.encryptedPassword = await bcrypt.hash(
          req.body.encryptedPassword,
          salt
        );
      }

      //update user with updated data or with New password
      user = await UserServices.updateUserById(
        { _id: user._id },
        { ...req.body }
      );

      //responses
      return successResponse(res, messageUtil.resetPassword, user); //response success msg
    } catch (error) {
      return serverErrorResponse(res, error); //response error msg
    }
  };
}

module.exports = new User();
