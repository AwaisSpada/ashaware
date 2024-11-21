const messageUtil = require("../utilities/message");
const userServices = require("../services/userServices");
const classServices = require("../services/classServices");
const schoolServices = require("../services/schoolServices");
const announcementServices = require("../services/announcementServices");

const {
  successResponse,
  existAlreadyResponse,
  notFoundResponse,
  badRequestErrorResponse,
  serverErrorResponse,
  authorizationErrorResponse,
} = require("../utilities/response");

class Announcement {
  addAnnouncement = async (req, res) => {
    let students = [];
    const { message, for_class, lesson_url } = req.body;

    let errors = [];

    if (!message) {
      errors.push("message");
    }

    if (!for_class) {
      errors.push("class");
    }

    if (!lesson_url) {
      errors.push("lesson");
    }

    if (errors.length > 0) {
      errors = errors.join(", ");
      return badRequestErrorResponse(res, `Please insert: ${errors}`);
    }

    try {
      let user = await userServices.getUserDetails({
        _id: req.userId,
        isDelete: false,
      });

      if (!user) {
        return notFoundResponse(res, messageUtil.NotFound);
      }

      if (user.userRole != "teacher") {
        return authorizationErrorResponse(res, messageUtil.unAuthorized);
      }

      let classs = await classServices.getClassDetails({ _id: for_class });

      if (!classs) notFoundResponse(res, messageUtil.NotFound);

      const studentIds = classs.students.map((student) => student._id);

      students = studentIds ?? [];

      let createAnnouncement = await announcementServices.createAnnouncement({
        ...req.body,
        students: students,
        teacher: req.userId,
        school: classs.school,
      });

      if (students.length > 0) {
        for (let i = 0; i < students?.length; i++) {
          await userServices.updateUserById(
            { _id: students[i] },
            { $push: { announcement_for: createAnnouncement._id } }
          );
        }
      }

      await userServices.updateUserById(
        { _id: req.userId },
        { $push: { announcement_to: createAnnouncement._id } }
      );

      await classServices.updateClass(
        { _id: for_class },
        { $push: { announcements: createAnnouncement._id } }
      );

      return successResponse(
        res,
        messageUtil.createAnnouncement,
        createAnnouncement
      );
    } catch (error) {
      serverErrorResponse(res, error);
    }
  };

  getAnnouncement = async (req, res) => {
    const { announcementId } = req.params;
    try {
      let announcement = await announcementServices.getAnnouncementDetails({
        _id: announcementId,
      });

      if (!announcement)
        notFoundResponse(res, messageUtil.announcementNotFound);

      return successResponse(res, messageUtil.announcementFound, announcement);
    } catch (error) {
      serverErrorResponse(res, error);
    }
  };

  deleteAnnouncement = async (req, res) => {
    const { announcementId } = req.params;
    try {
      let user = await userServices.getUserDetails({
        _id: req.userId,
        isDelete: false,
      });

      if (!user) {
        return notFoundResponse(res, messageUtil.NotFound);
      }

      if (user.userRole === "teacher" || user.userRole === "schoolAdmin") {
        let getAnnouncement = await announcementServices.getAnnouncementDetails(
          {
            _id: announcementId,
          }
        );

        if (!getAnnouncement)
          notFoundResponse(res, messageUtil.announcementNotFound);

        //find assignment and update delete status
        let announcement = await announcementServices.updateAnnouncement(
          { _id: announcementId, isActive: true, isDelete: false },
          { isActive: false, isDelete: true }
        );

        for (let i = 0; i < getAnnouncement?.students?.length; i++) {
          await userServices.updateUserById(
            { _id: getAnnouncement.students[i] },
            { $pull: { announcement_for: getAnnouncement._id } }
          );
        }

        await userServices.updateUserById(
          { _id: getAnnouncement.teacher },
          { $pull: { announcement_to: getAnnouncement._id } }
        );

        await classServices.updateClass(
          { _id: getAnnouncement.for_class },
          { $pull: { announcements: announcementId } }
        );

        //responses
        return successResponse(res, messageUtil.deleteSuccess, announcement); //response success msg
      }
      return authorizationErrorResponse(res, messageUtil.unAuthorized);
    } catch (error) {
      serverErrorResponse(res, error); //response error msg
    }
  };

  getAllAnnouncements = async (req, res) => {
    try {
      const user = await userServices.getUserDetails({
        _id: req.userId,
        isDelete: false,
      });

      if (!user) {
        return notFoundResponse(res, messageUtil.NotFound);
      }

      let object = {
        isDelete: false,
        isActive: true,
      };

      if (user.userRole === "teacher") {
        object.teacher = req.userId;
      } else if (user.userRole === "student") {
        object.students = req.userId;
      } else if (user.userRole === "schoolAdmin") {
        // Check for "school_admin" role
        // No additional filtering for school admins; they can see all assignments
      } else {
        return notFoundResponse(res, messageUtil.announcementNotFound);
      }

      const announcements = await announcementServices.getAllAnnouncements(
        object
      );

      if (announcements.length === 0) {
        return notFoundResponse(res, messageUtil.announcementNotFound);
      }

      return successResponse(res, messageUtil.announcementFound, announcements);
    } catch (err) {
      serverErrorResponse(res, err);
    }
  };

  updateAnnouncement = async (req, res) => {
    const { announcementId } = req.params;
    try {
      let user = await userServices.getUserDetails({
        _id: req.userId,
        isDelete: false,
      });

      if (!user) {
        return notFoundResponse(res, messageUtil.NotFound);
      }

      if (user.userRole != "teacher") {
        return authorizationErrorResponse(res, messageUtil.unAuthorized);
      }

      let announcement = await announcementServices.updateAnnouncement(
        { _id: announcementId },
        { ...req.body }
      );
      if (!announcement)
        return notFoundResponse(res, messageUtil.announcementNotFound);

      return successResponse(
        res,
        messageUtil.announcementUpdated,
        announcement
      );
    } catch (error) {
      serverErrorResponse(res, error); //response error msg
    }
  };
}

module.exports = new Announcement();
