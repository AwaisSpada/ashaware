"use strict";
const rateLimit = require("express-rate-limit");
const { manyRequestErrorResponse } = require("./response");
const messageUtil = require("./message");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // skipSuccessfulRequests: false,
  handler: (request, response, next, options) =>
    manyRequestErrorResponse(response, messageUtil.limit),
});
module.exports = {
  limiter: limiter,
};
