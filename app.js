const run = require("./src/server");
const express = require("express");
var cors = require("cors");
const { limiter } = require("./utilities/limiter");
const app = express();

app.use(cors());
run();
app.use("/", limiter);

var corsOption = {
  origin: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: [
    "Access-Control-Allow-Headers",
    "x-www-form-urlencoded",
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Access-Control-Allow-Origin",
  ],
  exposedHeaders: [
    "Access-Control-Allow-Headers",
    "x-www-form-urlencoded",
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Access-Control-Allow-Origin",
  ],
};
process.on("uncaughtException", function (error) {
  console.log("Some error occurred!!! : ", error);
});
