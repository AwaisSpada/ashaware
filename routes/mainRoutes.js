var express = require("express");
const userRoutes = require("./userRoutes");
const classRoutes = require("./classRoutes");
const schoolRoutes = require("./schoolRoutes");
const subjectRoutes = require("./subjectRoutes");
const lessonsRoutes = require("./lessonsRoutes");
const accountRoutes = require("./accountsRoutes");
const districtRoutes = require("./districtRoutes");
const questionRoutes = require("./questionRoutes");
const materialRoutes = require("./materialRoutes");
const AssignmentRoutes = require("./assignmentRoutes");
const AnnouncementRoutes = require("./announcementRoutes");

var router = express.Router();
router.use("/user", userRoutes);
router.use("/class", classRoutes);
router.use("/school", schoolRoutes);
router.use("/subject", subjectRoutes);
router.use("/account", accountRoutes);
router.use("/lessons", lessonsRoutes);
router.use("/district", districtRoutes);
router.use("/question", questionRoutes);
router.use("/material", materialRoutes);
router.use("/assignment", AssignmentRoutes);
router.use("/announcement", AnnouncementRoutes);

module.exports = router;
