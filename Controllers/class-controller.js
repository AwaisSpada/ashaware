const messageUtil = require("../utilities/message");
const userServices = require("../services/userServices");
const classServices = require("../services/classServices");
const schoolServices = require("../services/schoolServices");
const lessonServices = require("../services/lessonsServices");

// const subjectServices = require("../services/subjectServices");

const {
  successResponse,
  existAlreadyResponse,
  notFoundResponse,
  badRequestErrorResponse,
  serverErrorResponse,
} = require("../utilities/response");

class Class {
  AddClass = async (req, res) => {
    const { className, subject, lessons } = req.body;

    let errors = [];

    if (!className) {
      errors.push("className");
    }

    // if (!subject) errors.push("subject");

    if (errors.length > 0) {
      errors = errors.join(", ");
      return badRequestErrorResponse(res, `Please insert: ${errors}`);
    }
    try {
      let school = "";
      let teacher = "";
      let students = [];

      // let findSubject = await subjectServices.getSubjectDetails({
      //   subjectName: subject,
      // });

      // if (!findSubject)
      //   return badRequestErrorResponse(res, messageUtil.NotFound);

      let user = await userServices.getUserDetails({
        _id: req.userId,
        isDelete: false,
      });

      if (!user) {
        return notFoundResponse(res, messageUtil.NotFound);
      }

      if (user.userRole === "teacher" || user.userRole === "schoolAdmin") {
        const schoolQuery = {
          $or: [
            {
              teachers: req.userId,
            },
            {
              schoolAdmin: req.userId,
            },
          ],
          isDelete: false,
          isActive: true,
        };

        school = await schoolServices.getSchoolDetails(schoolQuery);
      }

      if (!school) {
        return notFoundResponse(res, messageUtil.schoolNotFound);
      }

      let getClass = await classServices.getClassDetails({
        className,
        isActive: true,
        isDelete: false,
      });

      if (!getClass) {
        let object = {
          className,
          lessons: lessons ?? "",
          school: school._id.toString(),
          // subject: findSubject._id.toString(),
        };

        if (user.userRole === "schoolAdmin") {
          if (req.body.teacher) {
            teacher = await userServices.getUserDetails({
              email: req.body.teacher,
              isDelete: false,
            });

            if (!teacher) {
              return badRequestErrorResponse(res, messageUtil.NotFound);
            }
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

        object = {
          className,
          school: school._id.toString(),
          lessons,
          // subject: findSubject._id.toString(),
        };

        if (req.body.students?.length > 0) {
          object.students = students;
        }

        if (req.body.teacher) {
          object.teacher = teacher._id.toString();
        } else {
          object.teacher = user?._id.toString();
        }

        let createClass = await classServices.createClass(object);

        await createClass.save();

        await schoolServices.updateSchool(
          {
            _id: school,
          },
          {
            $push: {
              classes: createClass._id,
            },
          }
        );

        for (let i = 0; i < lessons?.length; i++) {
          await lessonServices.updateLessonsById(
            {
              _id: lessons[i],
            },
            {
              $push: {
                assigned_classes: createClass._id,
              },
            }
          );
        }

        for (let i = 0; i < students?.length; i++) {
          await userServices.updateUserById(
            {
              _id: students[i],
            },
            {
              $push: {
                assigned_classes: createClass._id,
              },
            }
          );
        }

        if (user.userRole === "teacher") {
          await userServices.updateUserById(
            {
              _id: user._id,
            },
            {
              $push: {
                assigned_classes: createClass._id,
              },
            }
          );
        } else {
          await userServices.updateUserById(
            {
              email: req.body.teacher,
            },
            {
              $push: {
                assigned_classes: createClass._id,
              },
            }
          );
        }

        return successResponse(res, messageUtil.classRegister, createClass);
      } else {
        return existAlreadyResponse(res, messageUtil.classAlreadyExist);
      }
    } catch (error) {
      serverErrorResponse(res, error);
    }
  };

  GetAllClasses = async (req, res) => {
    try {
      let getClass = await classServices.getAllClasses({
        isDelete: false,
        isActive: true,
      });

      if (getClass.length === 0) {
        notFoundResponse(res, messageUtil.classNotFound);
      }
      return successResponse(res, messageUtil.classFound, getClass); //response success
    } catch (err) {
      serverErrorResponse(res, err); //response error
    }
  };

  GetClassById = async (req, res) => {
    const { id } = req.params;
    try {
      let getClass = await classServices.getClassDetails({
        _id: id,
        isDelete: false,
        isActive: true,
      });

      if (!getClass) {
        notFoundResponse(res, messageUtil.classNotFound);
      }

      return successResponse(res, messageUtil.classFound, getClass); //response success
    } catch (err) {
      serverErrorResponse(res, err); //response error
    }
  };

  UpdateClassById = async (req, res) => {
    const { id } = req.params;
    const { students } = req.body;

    // let updateLessons;
    let existingIds;

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

      if (user.userRole === "teacher" || user.userRole === "schoolAdmin") {
        let findClass = await classServices.getClassDetails({ _id: id });

        if (!findClass) {
          return notFoundResponse(res, messageUtil.NotFound);
        }

        const studentIds = findClass.students.map((student) => student._id);

        // Sample array with IDs from req.body

        const array2 = req.body.students;

        existingIds = array2?.filter((std) => {
          return !studentIds?.includes(std);
        });

        //find class for update

        let getClass = await classServices.updateClass(
          {
            _id: id,
            isDelete: false,
            isActive: true,
          },
          {
            ...req.body,
          },
          {
            _id: students,
          }
        );

        const lessonIds = getClass.lessons.map((lesson) => lesson._id);

        if (req.body.lessons) {
          for (let i = 0; i < lessonIds.length; i++) {
            await lessonServices.updateLessonsById(
              {
                _id: lessonIds[i],
              },
              {
                $push: {
                  assigned_classes: getClass._id,
                },
              }
            );
          }

          for (let i = 0; i < getClass.students.length; i++) {
            await userServices.updateUserById(
              {
                _id: getClass.students[i],
              },
              {
                $push: {
                  assigned_classes: getClass._id,
                },
              }
            );
          }
        }

        if (req.body.students) {
          for (let i = 0; i < existingIds?.length; i++) {
            await userServices.updateUserById(
              {
                _id: existingIds[i],
              },
              {
                $push: {
                  assigned_classes: getClass._id,
                },
              }
            );
          }
        }

        if (req.body.removedUsers) {
          for (let i = 0; i < req.body.removedUsers?.length; i++) {
            await userServices.updateUserById(
              {
                _id: req.body.removedUsers[i],
              },
              {
                $pull: {
                  assigned_classes: getClass._id,
                },
              }
            );
          }

          for (let i = 0; i < req.body.removedUsers?.length; i++) {
            await userServices.updateUserById({
              _id: req.body.removedUsers[i],
            });
          }
        }

        //responses

        return successResponse(res, messageUtil.classUpdated, getClass); //response success
      }
    } catch (err) {
      serverErrorResponse(res, err); //response error
    }
  };

  RemoveClassById = async (req, res) => {
    const { id } = req.params;

    try {
      let getClass = await classServices.updateClass(
        {
          _id: id,
          isActive: true,
          isDelete: false,
        },
        {
          isActive: false,
          isDelete: true,
        }
      );
      for (let i = 0; i < getClass.students?.length; i++) {
        await userServices.updateUserById(
          { _id: getClass.students[i] },
          { $pull: { assigned_classes: getClass._id } }
        );
      }

      await userServices.updateUserById(
        { _id: getClass.teacher._id },
        { $pull: { assigned_classes: getClass._id } }
      );

      for (let i = 0; i < getClass.lessons?.length; i++) {
        await lessonServices.updateLessonsById(
          { _id: getClass.lessons[i] },
          { $pull: { assigned_classes: getClass._id } }
        );
      }

      return successResponse(res, messageUtil.classDeleted, getClass); //response success
    } catch (err) {
      serverErrorResponse(res, err); //response error
    }
  };

  schoolClassCreation = async (req, res) => {
    const { className } = req.body;

    let errors = [];

    if (!className) {
      errors.push("className");
    }

    if (errors.length > 0) {
      errors = errors.join(", ");
      return badRequestErrorResponse(res, `Please insert: ${errors}`);
    }

    try {
      let school = await schoolServices.getSchoolDetails({
        schoolAdmin: req.userId,
        isDelete: false,
      });

      if (!school) {
        return badRequestErrorResponse(res, messageUtil.NotFound);
      }

      let getClass = await classServices.getClassDetails({
        className,
        isActive: true,
        isDelete: false,
      });

      if (getClass) {
        return existAlreadyResponse(res, messageUtil.classAlreadyExist);
      }

      getClass = await classServices.createClass({
        ...req.body,
        school: school._id,
      });

      await getClass.save();

      return successResponse(res, messageUtil.classRegister, getClass); //success response
    } catch (error) {
      serverErrorResponse(res, error); //error response
    }
  };

  teacherClasses = async (req, res) => {
    try {
      let teacher = await userServices.getUserDetails({
        _id: req.userId,
        isDelete: false,
        isActive: true,
      });

      if (!teacher) {
        return notFoundResponse(res, messageUtil.NotFound);
      }

      let classes = await classServices.getAllClasses({
        teacher: teacher._id,
        isDelete: false,
      });

      return successResponse(res, messageUtil.allClasses, classes); //response success
    } catch (err) {
      serverErrorResponse(res, err); //response error
    }
  };

  teacherStudents = async (req, res) => {
    try {
      let teacher = await userServices.getUserDetails({
        _id: req.userId,
        isDelete: false,
        isActive: true,
      });

      if (!teacher) {
        return notFoundResponse(res, messageUtil.NotFound);
      }

      let classes = await classServices.getAllClasses({
        teacher: teacher._id,
        isDelete: false,
      });

      let users = [];

      classes.forEach((Class) => {
        Class.students.forEach((student) => {
          if (!student.isDelete) {
            users.push({
              _id: student._id,
              name: student.name,
              email: student.email,
              userRole: student.userRole,
              teacherId: teacher._id,
              className: Class.className,
            });
          }
        });
      });

      return successResponse(res, messageUtil.studentsFound, users); //response success
    } catch (err) {
      serverErrorResponse(res, err); //response error
    }
  };

  teacherStats = async (req, res) => {
    try {
      let teacher = await userServices.getUserDetails({
        _id: req.userId,
        isDelete: false,
        isActive: true,
      });

      if (!teacher) {
        return notFoundResponse(res, messageUtil.NotFound);
      }

      let classes = await classServices.getAllClasses({
        teacher: teacher._id,
        isDelete: false,
      });

      let studentsArray = [];

      classes.forEach((Class) => {
        Class.students.forEach((student) => {
          if (!student.isDelete) {
            studentsArray.push({
              _id: student._id,
            });
          }
        });
      });

      return successResponse(res, messageUtil.teacherStats, {
        studentsArray: studentsArray.length,
      }); //response success
    } catch (err) {
      serverErrorResponse(res, err); //response error
    }
  };
}

module.exports = new Class();
