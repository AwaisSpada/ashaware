var express = require("express");
const { checkToken } = require("../Middlewares/tokenAuth");
const { isTeacher } = require("../Middlewares/isTeacher");
const announcement = require("../Controllers/announcement-controller");
var router = express.Router();
////////District Api//////////
router.post("/addAnnouncement", checkToken, announcement.addAnnouncement);

router.get("/allAnnouncements", checkToken, announcement.getAllAnnouncements);

router.get(
  "/getAnnouncement/:announcementId",
  checkToken,
  announcement.getAnnouncement
);

router.put(
  "/deleteAnnouncement/:announcementId",
  checkToken,
  announcement.deleteAnnouncement
);

router.put(
  "/updateAnnouncement/:announcementId",
  isTeacher,
  checkToken,
  announcement.updateAnnouncement
);

module.exports = router;
