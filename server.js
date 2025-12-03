/**************************************************************
* File Name: server.js
* Author: Neel S Patel
* Course: WEB322
* Seneca Email: nspatel55@myseneca.ca
* Date: December 2, 2025
*
* Description:
*   Main entry point for WEB322 Assignment 3.
**************************************************************/

require("dotenv").config({ path: "./.env" });

const express = require("express");
const session = require("client-sessions");
const exphbs = require("express-handlebars");

const { connectMongo, initPostgres } = require("./config/db");

// Load Sequelize models BEFORE routes
require("./models/Task");

// Routes
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

// Initialize app
const app = express();

// -------------------- View Engine -------------------- //
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

// -------------------- Middleware -------------------- //
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// -------------------- Sessions -------------------- //
app.use(
    session({
        cookieName: "session",
        secret: process.env.SESSION_SECRET,
        duration: 30 * 60 * 1000,
        activeDuration: 5 * 60 * 1000,
    })
);

// Make session available in templates
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// -------------------- Databases -------------------- //
console.log("⏳ Connecting Mongo...");
connectMongo();

console.log("⏳ Initializing Postgres...");
initPostgres(); // Only once

// -------------------- ROUTES -------------------- //
console.log("🔥 LOADING ROUTES...");
app.use("/", authRoutes);
app.use("/", taskRoutes);

// Default route
app.get("/", (req, res) => {
    if (req.session.user) return res.redirect("/dashboard");
    res.redirect("/login");
});

// -------------------- Start Server -------------------- //
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;
