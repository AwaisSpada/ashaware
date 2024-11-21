const messageUtil = require("../utilities/message");
const userServices = require("../services/userServices");
const classServices = require("../services/classServices");
const assignmentServices = require("../services/assignmentServices");
const AssignmentMOdel = require("../Models/assignment-schema");
const SubmittedAssignment = require("../Models/submit-assignment");
const AWS = require("@aws-sdk/client-s3");
const s3 = new AWS.S3Client({ region: process.env.AWS_REGION });
const uploadFileToS3 = async (file) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${Date.now()}_${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };
  try {
    const command = new AWS.PutObjectCommand(params);
    await s3.send(command); // Send the command
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    return fileUrl; // The URL of the uploaded file
  } catch (error) {
    console.log("error :>> ", error);
  }
};
const {
  successResponse,
  notFoundResponse,
  badRequestErrorResponse,
  serverErrorResponse,
  authorizationErrorResponse,
} = require("../utilities/response");
class Assignment {
  addAssignment = async (req, res) => {
    let students = [];
    const { title, points, for_class, lesson_url, due_date } = req.body;
    let errors = [];
    if (!title) errors.push("title");
    if (!points) errors.push("points");
    if (!for_class) errors.push("for_class");
    if (!lesson_url) errors.push("lesson");
    if (!due_date) errors.push("due_date");
    if (errors.length > 0) {
      errors = errors.join(", ");
      return badRequestErrorResponse(res, `Please insert: ${errors}`);
    }
    try {
      let user = await userServices.getUserDetails({
        _id: req.userId,
        isDelete: false,
      });
      if (!user) return notFoundResponse(res, messageUtil.NotFound);
      if (user.userRole != "teacher")
        return authorizationErrorResponse(res, messageUtil.unAuthorized);
      let classs = await classServices.getClassDetails({ _id: for_class });
      if (!classs) notFoundResponse(res, messageUtil.NotFound);
      const studentIds = classs.students.map((student) => student._id);
      students = studentIds ?? [];
      let createAssignment = await assignmentServices.createAssignment({
        ...req.body,
        students: students,
        teacher: req.userId,
        school: classs.school,
      });
      if (students.length > 0)
        for (let i = 0; i < students?.length; i++)
          await userServices.updateUserById(
            { _id: students[i] },
            { $push: { assignment_for: createAssignment._id } }
          );
      await userServices.updateUserById(
        { _id: req.userId },
        { $push: { assignment_to: createAssignment._id } }
      );
      await classServices.updateClass(
        { _id: for_class },
        { $push: { assignments: createAssignment._id } }
      );
      return successResponse(
        res,
        messageUtil.createAssignment,
        createAssignment
      );
    } catch (error) {
      serverErrorResponse(res, error);
    }
  };
  getAssignment = async (req, res) => {
    const { assignmentId } = req.params;
    try {
      let assignment = await assignmentServices.getAssignmentDetails({
        _id: assignmentId,
      });
      if (!assignment) notFoundResponse(res, messageUtil.assignmentNotFound);
      return successResponse(res, messageUtil.assignmentFound, assignment);
    } catch (error) {
      serverErrorResponse(res, error);
    }
  };
  deleteAssignment = async (req, res) => {
    const { assignmentId } = req.params;
    try {
      let user = await userServices.getUserDetails({
        _id: req.userId,
        isDelete: false,
      });
      if (!user) return notFoundResponse(res, messageUtil.NotFound);
      if (user.userRole === "teacher" || user.userRole === "schoolAdmin") {
        let getAssignment = await assignmentServices.getAssignmentDetails({
          _id: assignmentId,
        });
        if (!getAssignment)
          notFoundResponse(res, messageUtil.assignmentNotFound);
        let assignment = await assignmentServices.updateAssignment(
          { _id: assignmentId, isActive: true, isDelete: false },
          { isActive: false, isDelete: true }
        );
        for (let i = 0; i < getAssignment?.students?.length; i++)
          await userServices.updateUserById(
            { _id: getAssignment.students[i] },
            { $pull: { assignment_for: getAssignment._id } }
          );
        await userServices.updateUserById(
          { _id: getAssignment.teacher },
          { $pull: { assignment_to: getAssignment._id } }
        );
        await classServices.updateClass(
          { _id: getAssignment.for_class },
          { $pull: { assignments: assignmentId } }
        );
        return successResponse(res, messageUtil.deleteSuccess, assignment); //response success msg
      }
      return authorizationErrorResponse(res, messageUtil.unAuthorized);
    } catch (error) {
      serverErrorResponse(res, error); //response error msg
    }
  };
  getAllAssignments = async (req, res) => {
    try {
      const user = await userServices.getUserDetails({
        _id: req.userId,
        isDelete: false,
      });
      if (!user) return notFoundResponse(res, messageUtil.NotFound);
      let object = { isDelete: false, isActive: true };
      if (user.userRole === "teacher") object.teacher = req.userId;
      else if (user.userRole === "student") object.students = req.userId;
      else if (user.userRole === "schoolAdmin") {
      } else return notFoundResponse(res, messageUtil.assignmentNotFound);
      const assignments = await assignmentServices.getAllAssignments(object);
      if (assignments.length === 0)
        return notFoundResponse(res, messageUtil.assignmentNotFound);
      if (user.userRole === "student") {
        const assignmentIds = assignments.map((assignment) => assignment._id);

        // Fetch all submitted assignments where assignment is in assignmentIds and student is req.userId
        const submittedAssignments = await SubmittedAssignment.find({
          assignment: { $in: assignmentIds },
          student: req.userId,
        });

        // Create a result that includes each assignment with the respective submitted assignment
        const result = assignments.map((assignment) => {
          // Find the corresponding submitted assignment for this assignment
          const submittedAssignment = submittedAssignments.find(
            (submission) =>
              String(submission.assignment) === String(assignment._id)
          );

          // Attach the submitted assignment (if found) to the assignment object
          return {
            ...assignment.toObject(), // Convert the Mongoose document to plain JS object
            submittedAssignment: submittedAssignment || null, // Attach or set null if not found
          };
        });

        // Return the response with assignments along with submitted assignments
        return successResponse(res, messageUtil.assignmentFound, result);
      } else {
        return successResponse(res, messageUtil.assignmentFound, assignments);
      }
    } catch (err) {
      serverErrorResponse(res, err);
    }
  };
  getAllSubmittedAssignments = async (req, res) => {
    try {
      const user = await userServices.getUserDetails({
        _id: req.userId,
        isDelete: false,
      });
      if (!user) return notFoundResponse(res, messageUtil.NotFound);
      let object = { isDelete: false, isActive: true };
      if (user.userRole === "teacher") object.teacher = req.userId;
      else if (user.userRole === "student") object.students = req.userId;
      else if (user.userRole === "schoolAdmin") {
      } else return notFoundResponse(res, messageUtil.assignmentNotFound);
      const assignments = await assignmentServices.getAllAssignments(object);
      if (assignments.length === 0)
        return successResponse(res, messageUtil.assignmentFound, []);
      const assignmentIds = assignments.map((assignment) => assignment._id);
      const submittedAssignments = await SubmittedAssignment.find({
        assignment: { $in: assignmentIds },
      })
        .populate("assignment")
        .populate("student");
      if (submittedAssignments.length === 0)
        return successResponse(res, messageUtil.assignmentFound, []);
      return successResponse(
        res,
        messageUtil.assignmentFound,
        submittedAssignments
      );
    } catch (err) {
      serverErrorResponse(res, err);
    }
  };
  updateAssignment = async (req, res) => {
    const { assignmentId } = req.params;
    try {
      let user = await userServices.getUserDetails({
        _id: req.userId,
        isDelete: false,
      });
      if (!user) return notFoundResponse(res, messageUtil.NotFound);
      if (user.userRole != "teacher")
        return authorizationErrorResponse(res, messageUtil.unAuthorized);
      let assignment = await assignmentServices.updateAssignment(
        { _id: assignmentId },
        { ...req.body }
      );
      if (!assignment)
        return notFoundResponse(res, messageUtil.assignmentNotFound);
      return successResponse(res, messageUtil.assignmentUpdated, assignment);
    } catch (error) {
      serverErrorResponse(res, error); //response error msg
    }
  };
  submitAssignment = async (req, res) => {
    const { assignmentId, studentId } = req.body;
    try {
      const assignment = await AssignmentMOdel.findById(assignmentId);
      if (!assignment)
        return res.status(404).json({ error: "Assignment not found" });
      const existingSubmission = await SubmittedAssignment.findOne({
        assignment: assignmentId,
        student: studentId,
      });
      if (existingSubmission)
        return res
          .status(400)
          .json({ error: "Student has already submitted this assignment" });
      const file = req.file; // Multer will attach file to req.file
      if (!file) return res.status(400).json({ error: "No file uploaded" });
      const fileUrl = await uploadFileToS3(file);
      const newSubmission = new SubmittedAssignment({
        assignment: assignmentId,
        student: studentId,
        file_url: fileUrl,
      });
      await newSubmission.save();
      return res
        .status(201)
        .json({ message: "Assignment submitted successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  };
  markAssignment = async (req, res) => {
    const { submitAssignmentId, points } = req.body;
    try {
      if (!submitAssignmentId || !points)
        return res
          .status(400)
          .json({ error: "Assignment ID and points are required" });
      const submittedAssignment = await SubmittedAssignment.findById(
        submitAssignmentId
      );
      if (!submittedAssignment)
        return res
          .status(404)
          .json({ error: "Submitted assignment not found" });
      submittedAssignment.points = points;
      await submittedAssignment.save();
      return res.status(200).json({
        message: "Assignment marked successfully",
        submittedAssignment,
      });
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  };
}
module.exports = new Assignment();
