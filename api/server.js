const express = require("express");
const session = require("client-sessions");
const exphbs = require("express-handlebars");
const serverless = require("serverless-http");

require("dotenv").config();

const { connectMongo, initPostgres } = require("../config/db");
require("../models/Task");

const authRoutes = require("../routes/auth");
const taskRoutes = require("../routes/tasks");

const app = express();

// handlebars
app.engine(
  "handlebars",
  exphbs.engine({
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", __dirname + "/../views");

// static folder
app.use(express.static(__dirname + "/../public"));

// body parser
app.use(express.urlencoded({ extended: true }));

// session middleware
app.use(
  session({
    cookieName: "session",
    secret: process.env.SESSION_SECRET,
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
  })
);

// attach session globally
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// connect databases on cold start
(async () => {
  await connectMongo();
  await initPostgres();
})();

// load routes
app.use("/", authRoutes);
app.use("/", taskRoutes);

// default route
app.get("/", (req, res) => {
  if (req.session.user) return res.redirect("/dashboard");
  res.redirect("/login");
});

// EXPORT as Vercel serverless function
module.exports = serverless(app);
