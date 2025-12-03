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

// ---------------- HANDLEBARS ----------------
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

// ---------------- STATIC FOLDER ----------------
app.use(express.static(__dirname + "/../public"));

// ---------------- BODY PARSER ----------------
app.use(express.urlencoded({ extended: true }));

// ---------------- SESSIONS ----------------
app.use(
  session({
    cookieName: "session",
    secret: process.env.SESSION_SECRET,
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// ---------------- CONNECT DATABASES ONCE ----------------
let initialized = false;

async function initDatabases() {
  if (!initialized) {
    console.log("Initializing Mongo + Postgres (ONE TIME ONLY)...");
    await connectMongo();
    await initPostgres();
    initialized = true;
  }
}

// Call once on first invocation
initDatabases();

// ---------------- ROUTES ----------------
app.use("/", authRoutes);
app.use("/", taskRoutes);

// ---------------- DEFAULT ROUTE ----------------
app.get("/", (req, res) => {
  if (req.session.user) return res.redirect("/dashboard");
  res.redirect("/login");
});

// ---------------- EXPORT FOR VERCEL ----------------
module.exports = serverless(app);
