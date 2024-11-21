const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const messageUtil = require("../utilities/message");
const userServices = require("../services/userServices");
const classServices = require("../services/classServices");
const statsServices = require("../services/statsServices");
const schoolServices = require("../services/schoolServices");
const subjectServices = require("../services/subjectServices");
const accountServices = require("../services/accountsServices");
const districtServices = require("../services/districtServices");
const allDistrictDataService = require("../services/allDataServices");
const { emailSender } = require("../utilities/emailSender");
const { emailVerification } = require("../utilities/emailVerification");
const {
  successResponse,
  existAlreadyResponse,
  notFoundResponse,
  badRequestErrorResponse,
  serverErrorResponse,
} = require("../utilities/response");
class School {
  AddSchool = async (req, res) => {
    const { schoolName, schoolEmail, schoolPhone, schoolAddress, district } =
      req.body;
    let errors = [];
    if (!schoolName) errors.push("schoolName");
    if (!schoolEmail) errors.push("schoolEmail");
    if (!schoolPhone) errors.push("schoolPhone");
    if (!schoolAddress) errors.push("schoolAddress");
    if (errors.length > 0) {
      errors = errors.join(", ");
      return badRequestErrorResponse(res, `Please insert: ${errors}`);
    }
    try {
      let district = "";
      let teachers = [];
      let students = [];
      let findDistrictQuery = {
        districtAdmin: req.userId,
        districtName: req.body.district,
        isDelete: false,
      };
      req.body.creator === "districtAdmin"
        ? delete findDistrictQuery.districtName
        : delete findDistrictQuery.districtAdmin;
      district = await districtServices.getDistrictDetails(findDistrictQuery);
      if (!district)
        return badRequestErrorResponse(res, messageUtil.districtNotFound);
      let findSchool = await schoolServices.getSchoolDetails({
        schoolName,
        isActive: true,
        isDelete: false,
      });
      if (findSchool) {
        return existAlreadyResponse(res, messageUtil.schoolExist);
      }
      if (req.body.teachers?.length > 0) {
        for (let i = 0; i < req.body.teachers.length; i++) {
          let findTeacher = await userServices.getUserDetails({
            email: req.body.teachers[i],
            isDelete: false,
          });
          teachers.push(findTeacher._id.toString());
        }
      }
      if (req.body.students?.length > 0) {
        for (let i = 0; i < req.body.students.length; i++) {
          let findStudent = await userServices.getUserDetails({
            email: req.body.students[i],
            isDelete: false,
          });
          students.push(findStudent._id.toString());
        }
      }
      let object;
      object = {
        schoolName,
        schoolEmail,
        district: district._id.toString(),
        schoolPhone,
        schoolAddress,
      };
      if (req.body.students?.length > 0) object.students = students;
      if (req.body.teachers?.length > 0) object.teachers = teachers;
      let user = await userServices.getUser({
        email: req.body.userDetails.email,
        isDelete: false,
      });
      if (user) return existAlreadyResponse(res, messageUtil.userExist);
      user = await userServices.createUser({ ...req.body.userDetails });
      object.schoolAdmin = user._id.toString();
      let account = await accountServices.createAccount({
        ...req.body.accountDetails,
        district: district._id,
      });
      object.accountId = account._id.toString();
      let school = await schoolServices.createSchool(object);
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
        { $push: { schools: school._id } }
      );

      //update account
      await accountServices.updateAccount(
        {
          _id: account._id,
        },
        {
          district: district._id,
          school: school._id,
        }
      );
      successResponse(res, messageUtil.schoolRegistered, school); //response Success Msg
    } catch (error) {
      serverErrorResponse(res, error); //response Error
    }
  };

  GetSchoolById = async (req, res) => {
    const { id } = req.params;
    try {
      //find school
      let school = await schoolServices.getSchoolDetails({
        _id: id,
        isDelete: false,
        isActive: true,
      });

      //return if not found
      if (!school) {
        notFoundResponse(res, messageUtil.NotFound);
      }

      //responses
      successResponse(res, messageUtil.ok, school); //response success
    } catch (err) {
      serverErrorResponse(res, err); //response error
    }
  };

  GetAllSchool = async (req, res) => {
    try {
      //find all schools
      let school = await schoolServices.getAllSchools({
        isActive: true,
        isDelete: false,
      });

      //return if schools not found
      if (school.length === 0) {
        notFoundResponse(res, messageUtil.NotFound);
      }

      //responses
      successResponse(res, messageUtil.ok, school); //response Success Msg
    } catch (err) {
      serverErrorResponse(res, err); //response Error Msg
    }
  };

  schoolFromToken = async (req, res) => {
    try {
      //find School from token
      let school = await schoolServices.getSchoolDetails({
        schoolAdmin: req.userId,
        isDelete: false,
        isActive: true,
      });

      //return If School Not Found
      if (!school) {
        notFoundResponse(res, messageUtil.NotFound);
      }

      //responses
      successResponse(res, messageUtil.ok, school); //response Success
    } catch (err) {
      serverErrorResponse(res, err); //response Error
    }
  };

  UpdateSchoolById = async (req, res) => {
    const { id } = req.params;
    // console.log("id", id);
    try {
      //find school and update
      let school = await schoolServices.updateSchool(
        {
          _id: id,
          isActive: true,
          isDelete: false,
        },
        {
          ...req.body,
        }
      );
      // console.log("school", school);

      //return if school not found
      if (!school) {
        notFoundResponse(res, messageUtil.NotFound);
      }

      //find user and update
      await userServices.updateUserById(
        {
          _id: req.body.userDetails.id,
          isDelete: false,
        },
        {
          ...req.body.userDetails,
        }
      );

      //find account and update
      if (req.body.accountDetails) {
        await accountServices.updateAccount(
          {
            _id: req.body.accountDetails.id,
            isDelete: false,
          },
          {
            ...req.body.accountDetails,
          }
        );
      }

      //responses
      successResponse(res, messageUtil.schoolUpdate, school); //response Success Msg
    } catch (err) {
      serverErrorResponse(res, err); //response Error Msg
    }
  };

  RemoveSchoolById = async (req, res) => {
    const { id } = req.params;
    try {
      //find school and update
      let school = await schoolServices.updateSchool(
        { _id: id, isActive: true, isDelete: false },
        { isActive: false, isDelete: true }
      );

      //return if not found
      if (!school) {
        notFoundResponse(res, messageUtil.NotFound);
      }

      //responses
      successResponse(res, messageUtil.schoolDelete, school); //response Success Msg
    } catch (err) {
      serverErrorResponse(res, err); //response Error Msg
    }
  };

  stats = async (req, res) => {
    try {
      //find All stats
      let stats = await statsServices.getAllStats({ isDelete: false });

      //return if not found
      if (!stats) {
        notFoundResponse(res, messageUtil.NotFound);
      }

      //responses
      successResponse(res, messageUtil.statsRecord, stats); //response Success Msg
    } catch (error) {
      serverErrorResponse(res, error); //response Error Msg
    }
  };

  // getSchoolUser = async (req, res) => {
  //   try {
  //     //find school
  //     let school = await schoolServices.getSchoolDetails({
  //       schoolAdmin: req.userId,
  //       isDelete: false,
  //       isActive: true,
  //     });
  //     console.log("school", req.userId);

  //     //return if school not found
  //     if (!school) {
  //       return notFoundResponse(res, messageUtil.schoolNotFound);
  //     }

  //     //initialize array
  //     let users = [];
  //     //iterate array
  //     if (req.body.userRole === "teachers") {
  //       school.teachers.forEach((teacher) => {
  //         console.log("school: ", school);
  //         if (!teacher.isDelete)
  //           users.push({
  //             _id: teacher._id,
  //             name: teacher.name,
  //             email: teacher.email,
  //             userRole: teacher.userRole,
  //             schoolId: school._id,
  //             schoolName: school.schoolName,
  //           });
  //       });
  //     }
  //     /*************************************/
  //     //iterate array
  //     if (req.body.userRole === "students") {
  //       console.log("school.students: ", school.students);
  //       school.students.forEach((student) => {
  //         if (!student.isDelete)
  //           users.push({
  //             _id: student._id,
  //             name: student.name,
  //             email: student.email,
  //             userRole: student.userRole,
  //             schoolId: school._id,
  //             schoolName: school.schoolName,
  //           });
  //       });
  //     }
  //     /*************************************/

  //     //responses
  //     return successResponse(res, messageUtil.schoolUsersFound, users); //response success
  //   } catch (err) {
  //     serverErrorResponse(res, err); //response error
  //   }
  // };

  getSchoolUser = async (req, res) => {
    try {
      let user = await userServices.getUserDetails({
        _id: req.userId,
        isDelete: false,
      });

      // return if user not found
      if (!user) {
        return notFoundResponse(res, messageUtil.NotFound);
      }
      // console.log("user", user);
      let school;

      // Check if the user is a teacher or schoolAdmin
      if (user.userRole === "teacher" || user.userRole === "schoolAdmin") {
        // If the user is a teacher or schoolAdmin, find the school associated with them
        const schoolQuery = {
          $or: [{ teachers: req.userId }, { schoolAdmin: req.userId }],
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

      // Initialize array
      let users = [];

      // Iterate through teachers or students based on the user's role
      if (req.body.userRole === "teachers") {
        school.teachers.forEach((teacher) => {
          if (!teacher.isDelete) {
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
      } else if (req.body.userRole === "students") {
        school.students.forEach((student) => {
          if (!student.isDelete) {
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
        return successResponse(res, messageUtil.schoolUsersFound, users);
      }
      return successResponse(res, messageUtil.schoolUsersFound, users);
    } catch (err) {
      serverErrorResponse(res, err);
    }
  };

  getSchoolStats = async (req, res) => {
    try {
      //find school
      // let school = await schoolServices.getSchoolDetails({
      //   schoolAdmin: req.userId,
      //   isDelete: false,
      //   isActive: true,
      // });
      // console.log("req.userId", req.userId);

      let user = await userServices.getUserDetails({
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
      //return if school not found
      if (!school) {
        return notFoundResponse(res, messageUtil.schoolNotFound);
      }

      // find all classes and pass schoolAdminId
      let classes = await classServices.getAllClasses({
        school: school._id,
        isDelete: false,
      });

      //initialize array
      let teachersArray = [];
      let studentsArray = [];
      // let schoool = [];
      // iterate teachers array
      // schoolAdmin.forEach((school) => {
      //   schoool.push(school.schoolName);
      // });
      school.teachers.forEach((teacher) => {
        if (!teacher.isDelete) teachersArray.push(teacher._id);
      });

      // iterate students array
      school.students.forEach((student) => {
        if (!student.isDelete) studentsArray.push(student._id);
      });

      //find length of arrays and pass it into success response
      return successResponse(res, messageUtil.schoolStats, {
        teachers: teachersArray.length,
        students: studentsArray.length,
        classes: classes.length,
        totalUsers: teachersArray.length + studentsArray.length,
        schoolName: school.schoolName,
      }); //response success
    } catch (err) {
      serverErrorResponse(res, err); //response error
    }
  };

  // getSchoolClasses = async (req, res) => {
  //   try {
  //     //find school
  //     let school = await schoolServices.getSchoolDetails({
  //       schoolAdmin: req.userId,
  //       isDelete: false,
  //       isActive: true,
  //     });

  //     //return if not found
  //     if (!school) {
  //       return notFoundResponse(res, messageUtil.schoolNotFound);
  //     }

  //     //find classes and pass schoolAdmin Id
  //     let classes = await classServices.getAllClasses({
  //       school: school._id,
  //       isDelete: false,
  //     });

  //     //responses
  //     return successResponse(res, messageUtil.allClasses, classes); //response success
  //   } catch (err) {
  //     serverErrorResponse(res, err); //response error
  //   }
  // };

  getSchoolClasses = async (req, res) => {
    try {
      let user = await userServices.getUserDetails({
        _id: req.userId,
        isDelete: false,
      });

      // Return if user not found
      if (!user) {
        return notFoundResponse(res, messageUtil.NotFound);
      }

      // console.log("user", user);
      let classes = [];
      let school;

      if (
        user.userRole === "teacher" ||
        user.userRole === "schoolAdmin" ||
        user.userRole === "student"
      ) {
        // If the user is a teacher or schoolAdmin, find the school associated with them
        const schoolQuery = {
          $or: [
            { teachers: req.userId },
            { schoolAdmin: req.userId },
            { students: req.userId },
          ],
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

      let classQuery = {
        school: school._id,
        isDelete: false,
      };

      if (user?.userRole === "student") {
        classQuery.students = req.userId; // Filter classes where the student is enrolled
      }

      classes = await classServices.getAllClasses(classQuery);

      // console.log("classes", classes);

      // Responses
      return successResponse(res, messageUtil.allClasses, classes); // Response success
    } catch (err) {
      serverErrorResponse(res, err); // Response error
    }
  };

  schoolAllData = async (req, res) => {
    try {
      //find school
      let school = await schoolServices.getSchoolDetails({
        schoolAdmin: req.userId,
        isDelete: false,
        isActive: true,
      });
      // console.log("req.userId", req.userId);
      // console.log("school", school);

      //return if not found
      if (!school) {
        return notFoundResponse(res, messageUtil.schoolNotFound);
      }

      //call all school data service
      let allData = await allDistrictDataService.getAllSchoolData(
        {
          userRole: req.body.userRole,
          isDelete: false,
        },
        { school: school._id }
      );

      //responses
      return successResponse(res, messageUtil.schoolData, {
        ...allData,
        // school,
      }); //response success
    } catch (err) {
      serverErrorResponse(res, err); //response error
    }
  };

  // Get teacher information including school, subject, and total students
  async getTeacherInfo(req, res) {
    try {
      // Find the school the teacher belongs to
      let school = await schoolServices.getSchoolDetails({
        teacher: req.userId,
        isDelete: false,
        isActive: true,
      });

      //return if school not found
      if (!school) {
        return notFoundResponse(res, messageUtil.schoolNotFound);
      }

      const { teacherId } = req.params;

      // Find the teacher by their ID
      const teacher = await userServices.getUserDetails({
        _id: teacherId,
        userRole: "teacher",
        // isDelete: true,
      });

      if (!teacher) {
        return notFoundResponse(res, "Teacher not found");
      }

      // Find the subject the teacher teaches
      const subject = await subjectServices.getSubjectDetails({
        //teacher: teacherId,
        subject: req.body.subjectName,
        // isDelete: false,
      });
      // console.log("subject", subject);

      // Count the total number of students in the subject
      const totalStudents = subject ? subject.students.length : 0;
      // console.log("totalStudents", totalStudents);

      // Construct the response
      const teacherInfo = {
        teacherName: teacher.name,
        schoolName: school.schoolName,
        subjectName: subject ? subject.subjectName : "N/A",
        totalStudents,
      };

      // Return the response
      successResponse(
        res,
        "Teacher information retrieved successfully",
        teacherInfo
      );
    } catch (err) {
      serverErrorResponse(res, err);
    }
  }
}

module.exports = new School();
