const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const userServices = require("../services/userServices");
const districtServices = require("../services/districtServices");
const allDistrictDataService = require("../services/allDataServices");
const messageUtil = require("../utilities/message");
const { emailSender } = require("../utilities/emailSender");
const { emailVerification } = require("../utilities/emailVerification");
const {
  successResponse,
  existAlreadyResponse,
  notFoundResponse,
  badRequestErrorResponse,
  serverErrorResponse,
} = require("../utilities/response");
class District {
  AddDistrict = async (req, res) => {
    const { districtName } = req.body;
    let errors = [];
    if (!districtName) errors.push("districtName");
    if (errors.length > 0) {
      errors = errors.join(", ");
      return badRequestErrorResponse(res, `Please insert: ${errors}`);
    }
    try {
      let district = await districtServices.getDistrictDetails({
        districtName,
        isActive: true,
        isDelete: false,
      });
      if (district) existAlreadyResponse(res, messageUtil.districtAlreadyExist);
      let user = await userServices.getUser({
        email: req.body.userDetails.email,
        isDelete: false,
      });
      if (user) return existAlreadyResponse(res, messageUtil.emailAlreadyExist);
      district = await districtServices.createDistrict({
        ...req.body,
      });
      user = await userServices.createUser({
        ...req.body.userDetails,
      });
      let verify = emailVerification(user);
      await emailSender(
        req.body.userDetails.email,
        "muhammadshahzad07618@gmail.com",
        verify.subject,
        verify.html
      );
      let salt = await bcrypt.genSalt(10);
      user.encryptedPassword = await bcrypt.hash(
        req.body.userDetails.encryptedPassword,
        salt
      );
      const buffer = crypto.randomBytes(4);
      const token = buffer.toString("hex");
      user.emailVerifyToken = token;
      user.emailExpireToken = Date.now() + 3.6e6;
      await user.save();
      await districtServices.updateDistrict(
        { _id: district._id },
        { districtAdmin: user._id }
      );
      return successResponse(res, messageUtil.districtRegister, district); //response success
    } catch (error) {
      serverErrorResponse(res, error); //response error
    }
  };
  GetDistrictById = async (req, res) => {
    const { id } = req.params;
    try {
      let district = await districtServices.getDistrictDetails({
        _id: id,
        isDelete: false,
        isActive: true,
      });
      if (!district) return notFoundResponse(res, messageUtil.districtNotFound);
      return successResponse(res, messageUtil.districtFound, district); //response success
    } catch (err) {
      serverErrorResponse(res, err); //response error
    }
  };
  GetAllDistrict = async (req, res) => {
    try {
      let district = await districtServices.getAllDistrict({
        isDelete: false,
        isActive: true,
      });
      if (district.length === 0)
        return notFoundResponse(res, messageUtil.districtNotFound);
      return successResponse(res, messageUtil.districtFound, district); //response success
    } catch (err) {
      serverErrorResponse(res, err); //response error
    }
  };
  UpdateDistrictById = async (req, res) => {
    const { id } = req.params;
    try {
      let district = await districtServices.updateDistrict(
        { _id: id, isDelete: false, isActive: true },
        { ...req.body }
      );
      await userServices.updateUserById(
        { _id: req.body.userDetails.id },
        { ...req.body.userDetails }
      );
      if (!district) return notFoundResponse(res, messageUtil.districtNotFound);
      return successResponse(res, messageUtil.districtUpdated, district); //response success
    } catch (err) {
      serverErrorResponse(res, err); //response error
    }
  };
  RemoveDistrictById = async (req, res) => {
    const { id } = req.params;
    try {
      let user = await districtServices.updateDistrict(
        { _id: id },
        { isActive: false, isDelete: true }
      );
      return successResponse(res, messageUtil.districtDeleted, user); //response success
    } catch (err) {
      serverErrorResponse(res, err); //response error
    }
  };
  getDistrictUser = async (req, res) => {
    try {
      let district = await districtServices.getDistrictDetails({
        districtAdmin: req.userId,
        isDelete: false,
        isActive: true,
      });
      if (!district) return notFoundResponse(res, messageUtil.districtNotFound);
      let users = [];
      district.schools.forEach((school) => {
        if (req.body.userRole === "schoolAdmin") {
          if (!school.schoolAdmin.isDelete)
            users.push({
              _id: school.schoolAdmin._id,
              name: school.schoolAdmin.name,
              email: school.schoolAdmin.email,
              userRole: school.schoolAdmin.userRole,
              schoolId: school._id,
              schoolName: school.schoolName,
            });
        }
        if (req.body.userRole === "teacher")
          school.teachers.forEach((teacher) => {
            const i = users.findIndex((e) => e.email === teacher.email);
            if (i < 1) {
              users.push({
                _id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                userRole: teacher.userRole,
                schoolId: school._id,
                schoolName: school.schoolName,
              });
            }
          });
        if (req.body.userRole === "student")
          school.students.forEach((student) => {
            const i = users.findIndex((e) => e.email === student.email);
            if (i < 1) {
              users.push({
                _id: student._id,
                name: student.name,
                email: student.email,
                userRole: student.userRole,
                schoolId: school._id,
                schoolName: school.schoolName,
              });
            }
          });
      });
      return successResponse(res, messageUtil.districtUsersFound, users); //response success
    } catch (err) {
      serverErrorResponse(res, err); //response error
    }
  };
  districtAllDetails = async (req, res) => {
    try {
      let district = await districtServices.getDistrictDetails({
        districtAdmin: req.userId,
        isDelete: false,
        isActive: true,
      });
      if (!district) return notFoundResponse(res, messageUtil.districtNotFound);
      let studentsArray = [];
      let teachersArray = [];
      let classes = 0;
      let schoolAdmins = district.schools.length;
      district.schools.forEach((school) => {
        school.teachers.forEach((teacher) => {
          if (!teachersArray.includes(teacher._id))
            teachersArray.push(teacher._id);
        });
        school.students.forEach((student) => {
          if (!studentsArray.includes(student._id))
            studentsArray.push(student._id);
        });
        classes = classes + school.classes.length;
      });
      return successResponse(res, messageUtil.districtRecord, {
        teachers: teachersArray.length,
        students: studentsArray.length,
        schoolAdmins,
        schools: district.schools.length,
        classes,
        totalUsers: teachersArray.length + studentsArray.length + schoolAdmins,
      }); //response success
    } catch (err) {
      serverErrorResponse(res, err); //response error
    }
  };
  districtAllData = async (req, res) => {
    try {
      let district = await districtServices.getDistrictDetails({
        districtAdmin: req.userId,
        isDelete: false,
        isActive: true,
      });
      if (!district) return notFoundResponse(res, messageUtil.districtNotFound);
      let allData = await allDistrictDataService.getAllDistrictData(
        { userRole: req.body.userRole, isDelete: false },
        { district: district._id }
      );
      return successResponse(res, messageUtil.districtAllRecord, {
        ...allData,
        district,
      }); //response success
    } catch (err) {
      serverErrorResponse(res, err); //response error
    }
  };
  districtAllClasses = async (req, res) => {
    try {
      let district = await districtServices.getDistrictDetails({
        districtAdmin: req.userId,
        isDelete: false,
        isActive: true,
      });
      if (!district) return notFoundResponse(res, messageUtil.districtNotFound);
      let classes = [];
      district.schools.forEach((school) => {
        school.classes.forEach((clas) => {
          if (!clas.isDelete)
            classes.push({
              className: clas.className,
              _id: clas._id,
              schoolName: school.schoolName,
              students: clas.students,
            });
        });
      });
      return successResponse(res, messageUtil.allClasses, classes); //response success
    } catch (err) {
      serverErrorResponse(res, err); //response error
    }
  };
}
module.exports = new District();
