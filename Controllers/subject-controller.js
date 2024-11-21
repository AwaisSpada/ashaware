const messageUtil = require("../utilities/message");
const subjectServices = require("../services/subjectServices");
const {
  successResponse,
  serverErrorResponse,
  notFoundResponse,
} = require("../utilities/response");

class Subject {
  AddSubject = async (req, res) => {
    let subject;
    try {
      //create subject record
      subject = await subjectServices.addSubject({
        ...req.body,
      });

      //responses
      successResponse(res, messageUtil.ok, subject); //response success
    } catch (err) {
      serverErrorResponse(res, err); //response Error
    }
  };
  getAllSubjects = async (req, res) => {
    let subject;
    try {
      //find all subjects
      subject = await subjectServices.getAllSubjects({
        isDelete: false,
      });

      //check length
      if (subject.length === 0) {
        notFoundResponse(res, messageUtil.NotFound); //return if not found
      }

      //responses
      else {
        successResponse(res, messageUtil.subjectsFound, subject); //success response
      }
    } catch (err) {
      serverErrorResponse(res, err); //error response
    }
  };
  removeSubject = async (req, res) => {
    const { id } = req.params;
    try {
      //find subject for removal
      let subject = await subjectServices.updateSubject(
        { _id: id, isActive: true, isDelete: false },
        { isActive: false, isDelete: true },
      );

      //responses
      successResponse(res, messageUtil.deleteSuccess, subject); //response success msg
    } catch (err) {
      serverErrorResponse(res, err); //response error msg
    }
  };
}
module.exports = new Subject();
