var express = require("express");
const lessons = require("../Controllers/lessons-controller");
const { checkToken } = require("../Middlewares/tokenAuth");
const { isTeacher } = require("../Middlewares/isTeacher");
// const {
//   singleFileUpload,
//   multipleImageUpload,
// } = require("../utilities/uploader");
const upload = require("../utilities/multer");

var router = express.Router();
////////lessons Api//////////
router.post(
  "/AddLessons",
  // upload.array("image"),
  checkToken,
  isTeacher,
  lessons.AddLessons
);
router.get("/GetLessonById/:lessonId", lessons.GetLessonById);
router.get("/GetAllLessons", lessons.GetAllLessons);
router.put(
  "/updateLessonsById/:lessonsId",
  // upload.array("image"),
  checkToken,
  isTeacher,
  lessons.updateLessonsById
); //add limiter as a middleware
router.delete(
  "/deleteLesson/:lessonId",
  checkToken,
  isTeacher,
  lessons.deleteLesson
);

module.exports = router;
