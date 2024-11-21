const lessonsSchema = require("../Models/lessons-schema");
const lessonsServices = require("../services/lessonsServices");
const messageUtil = require("../utilities/message");
const uploads = require("../utilities/uploader");

const {
  successResponse,
  existAlreadyResponse,
  badRequestErrorResponse,
  notFoundResponse,
  authorizationErrorResponse,
  serverErrorResponse,
} = require("../utilities/response");

class Lessons {
  AddLessons = async (req, res) => {
    try {
      const { title, age_group, description, link } = req.body;

      let errors = [];

      // if (!title) errors.push("title");

      // if (!age_group) errors.push("age_group");

      // if (!description) errors.push("description");

      if (!link) errors.push("link");

      if (errors.length > 0) {
        errors = errors.join(", ");
        return badRequestErrorResponse(res, `Please insert: ${errors}`);
      }

      let lessons = await lessonsServices.getLessons({ title });

      // if (lessons)
      //   return existAlreadyResponse(res, messageUtil.titleAlreadyExist);

      lessons = await lessonsServices.createLessons({ ...req.body });

      return successResponse(res, messageUtil.lessonRegister, lessons); //response success msg
    } catch (error) {
      return serverErrorResponse(res, error); //response error msg
    }
  };
  GetLessonById = async (req, res) => {
    const { lessonId } = req.params;
    let lessons;
    try {
      lessons = await lessonsServices.getLessons({ _id: lessonId });
      if (!lessons) notFoundResponse(res, messageUtil.NotFound); //response msg
      successResponse(res, messageUtil.ok, lessons); //response success msg
    } catch (error) {
      serverErrorResponse(res, error); //response error msg
    }
  };
  GetAllLessons = async (req, res) => {
    try {
      let lessons = await lessonsServices.getAllLessons();

      if (lessons.length < 1) {
        return notFoundResponse(res, messageUtil.NotFound);
      }

      return successResponse(res, messageUtil.ok, lessons); // Response success msg
    } catch (err) {
      return serverErrorResponse(res, err); // Response error msg
    }
  };

  updateLessonsById = async (req, res) => {
    const { lessonsId } = req.params;
    let lessons;
    try {
      lessons = await lessonsServices.updateLessonsById(
        { _id: lessonsId },
        { ...req.body }
      );
      if (!lessons) return notFoundResponse(res, messageUtil.NotFound);
      return successResponse(res, messageUtil.updateSuccess, lessons);
    } catch (err) {
      return serverErrorResponse(res, err);
    }
  };
  deleteLesson = async (req, res) => {
    const { lessonId } = req.params;
    let lessons;
    try {
      lessons = await lessonsServices.deleteLessons({ _id: lessonId });
      if (!lessons) notFoundResponse(res, messageUtil.NotFound); //response msg
      successResponse(res, messageUtil.ok, lessons); //response success msg
    } catch (error) {
      serverErrorResponse(res, error); //response error msg
    }
  };
}

module.exports = new Lessons();
