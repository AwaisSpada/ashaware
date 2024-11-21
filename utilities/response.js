const messageUtil = require("./message.js");
const { StatusCodes, getReasonPhrase } = require("http-status-codes");

const successResponse = (res, message, data, token) => {
  const response = {
    success: true,
    message,
  };

  if (data) {
    response.data = data;
    response.token = token;
  }

  res.status(StatusCodes.OK).send(response);
};

const serverErrorResponse = (res, error) => {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
    success: false,
    error: error.toString(),
    message: messageUtil.serverError,
  });
};

const validationErrorResponse = (res, errors) => {
  res.status(StatusCodes.NON_AUTHORITATIVE_INFORMATION).json({
    success: false,
    error: errors,
    message: messageUtil.validationErrors,
  });
};

const badRequestErrorResponse = (res, message) => {
  res.status(StatusCodes.BAD_REQUEST).send({
    success: false,
    message,
  });
};

const userExistResponse = (res, message) => {
  res.status(StatusCodes.OK).send({
    success: true,
    message,
  });
};

const existAlreadyResponse = (res, message) => {
  res.status(StatusCodes.CONFLICT).send({
    success: true,
    message,
  });
};

const notFoundResponse = (res, message) => {
  res.status(StatusCodes.NOT_FOUND).send({
    success: false,
    message,
  });
};

const authorizationErrorResponse = (res, message) => {
  res.status(StatusCodes.UNAUTHORIZED).send({
    success: false,
    message,
  });
};

const manyRequestErrorResponse = (res, message) => {
  res.status(StatusCodes.TOO_MANY_REQUESTS).send({
    success: false,
    message,
  });
};
module.exports = {
  successResponse,
  serverErrorResponse,
  validationErrorResponse,
  badRequestErrorResponse,
  userExistResponse,
  existAlreadyResponse,
  notFoundResponse,
  authorizationErrorResponse,
  manyRequestErrorResponse,
};
