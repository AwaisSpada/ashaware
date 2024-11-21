const messageUtil = require("../utilities/message");
const userServices = require("../services/userServices");
const classServices = require("../services/classServices");
const schoolServices = require("../services/schoolServices");
const materialServices = require("../services/materialServices");

const {
  successResponse,
  existAlreadyResponse,
  notFoundResponse,
  badRequestErrorResponse,
  serverErrorResponse,
  authorizationErrorResponse,
} = require("../utilities/response");

class Meterial {
  addMeterial = async (req, res) => {
    let students = [];
    const { title, topic, for_class, lesson_url } = req.body;

    let errors = [];

    if (!title) {
      errors.push("title");
    }

    if (!topic) {
      errors.push("topic");
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

      let createMaterial = await materialServices.createMaterial({
        ...req.body,
        students: students,
        teacher: req.userId,
      });

      if (students.length > 0) {
        for (let i = 0; i < students?.length; i++) {
          await userServices.updateUserById(
            { _id: students[i] },
            { $push: { material_for: createMaterial._id } }
          );
        }
      }

      await userServices.updateUserById(
        { _id: req.userId },
        { $push: { material_to: createMaterial._id } }
      );

      await classServices.updateClass(
        { _id: for_class },
        { $push: { materials: createMaterial._id } }
      );

      return successResponse(res, messageUtil.createMaterial, createMaterial);
    } catch (error) {
      serverErrorResponse(res, error);
    }
  };

  getMaterial = async (req, res) => {
    const { materialId } = req.params;
    try {
      let material = await materialServices.getMaterialDetails({
        _id: materialId,
      });

      if (!material) notFoundResponse(res, messageUtil.materialNotFound);

      return successResponse(res, messageUtil.materialFound, material);
    } catch (error) {
      serverErrorResponse(res, error);
    }
  };

  deleteMaterial = async (req, res) => {
    const { materialId } = req.params;
    try {
      let user = await userServices.getUserDetails({
        _id: req.userId,
        isDelete: false,
      });

      if (!user) {
        return notFoundResponse(res, messageUtil.NotFound);
      }

      if (user.userRole === "teacher" || user.userRole === "schoolAdmin") {
        let getMaterial = await materialServices.getMaterialDetails({
          _id: materialId,
        });

        if (!getMaterial) notFoundResponse(res, messageUtil.materialNotFound);

        //find assignment and update delete status
        let material = await materialServices.updateMaterial(
          { _id: materialId, isActive: true, isDelete: false },
          { isActive: false, isDelete: true }
        );

        for (let i = 0; i < getMaterial?.students?.length; i++) {
          await userServices.updateUserById(
            { _id: getMaterial.students[i] },
            { $pull: { material_for: getMaterial._id } }
          );
        }

        await userServices.updateUserById(
          { _id: getMaterial.teacher },
          { $pull: { material_to: getMaterial._id } }
        );

        await classServices.updateClass(
          { _id: getMaterial.for_class },
          { $pull: { materials: materialId } }
        );

        //responses
        return successResponse(res, messageUtil.deleteSuccess, material); //response success msg
      }
      return authorizationErrorResponse(res, messageUtil.unAuthorized);
    } catch (error) {
      serverErrorResponse(res, error); //response error msg
    }
  };

  getAllMaterials = async (req, res) => {
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
        return notFoundResponse(res, messageUtil.materialNotFound);
      }

      const materials = await materialServices.getAllMaterials(object);

      if (materials.length === 0) {
        return notFoundResponse(res, messageUtil.materialNotFound);
      }

      return successResponse(res, messageUtil.materialFound, materials);
    } catch (err) {
      serverErrorResponse(res, err);
    }
  };

  updateMaterial = async (req, res) => {
    const { materialId } = req.params;
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

      let material = await materialServices.updateMaterial(
        { _id: materialId },
        { ...req.body }
      );
      if (!material) return notFoundResponse(res, messageUtil.materialNotFound);

      return successResponse(res, messageUtil.materialUpdated, material);
    } catch (error) {
      serverErrorResponse(res, error); //response error msg
    }
  };
}

module.exports = new Meterial();
