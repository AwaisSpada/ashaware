const express = require("express");
const { default: AdminBro } = require("admin-bro");
const options = require("./admin.options");
const buildAdminRouter = require("./admin.router");
const app = express();
// const connectDB = require("../Config/dataBase");
var morgan = require("morgan");
var cors = require("cors");
require("../utilities/cronJob");
const routes = require("../routes/mainRoutes");
const PORT = process.env.PORT || 7001;
const admin = new AdminBro(options);
const router = buildAdminRouter(admin);
app.use(admin.options.rootPath, router);
// app.use(body - parser.json());
app.use(express.json());
app.use(express.urlencoded());
const run = async () => {
  app.use(morgan("dev"));
  app.use(cors());
  // app.use(express.urlencoded({ extended: false }));
  // app.use(express.json());
  app.get("/", (req, res) => {
    res.send("Hello from Ashaware backend");
  });
  app.use("/", routes);

  app.use((req, res, next) => {
    req.status = 404;
    const error = new Error("routes not found");
    next(error);
  });

  ///////production or enviornment/////
  if (app.get("env") === "production") {
    app.use((error, req, res, next) => {
      res.status(req.status || 500).send({
        message: error.message,
      });
    });
  } else
    app.use((error, req, res, next) => {
      res.status(req.status || 500).send({
        message: error.message,
        stack: error.stack,
      });
    });

  const connectDB = require("../Config/dataBase");
  ////////////////////////////////////
  connectDB();
  app.listen(PORT, () =>
    console.log(
      `Server Started on port ${PORT} && AdminBro is under http://localhost:${PORT}/admin`
    )
  );
};

module.exports = run;
