/**************************************************************
* File Name: routes/auth.js
* Author: Neel S Patel
* Course: WEB322
* Seneca Email: nspatel55@myseneca.ca
* Date: December 2, 2025
*
* Description:
*   Authentication routes:
*     - GET /register
*     - POST /register
*     - GET /login
*     - POST /login
*     - GET /logout
**************************************************************/
console.log("✔ auth.js LOADED");

const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// -------------------- REGISTER (GET) --------------------
router.get("/register", (req, res) => {
    res.render("register");
});

// -------------------- REGISTER (POST) --------------------
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const exists = await User.findOne({ email });

        if (exists) {
            return res.render("register", {
                error: "Email already in use.",
            });
        }

        const user = new User({ username, email, password });
        await user.save();

        res.redirect("/login");
    } catch (err) {
        console.error(err);
        res.render("register", { error: "Registration failed." });
    }
});

// -------------------- LOGIN (GET) --------------------
router.get("/login", (req, res) => {
    res.render("login");
});

// -------------------- LOGIN (POST) --------------------
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.render("login", { error: "Invalid email or password." });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.render("login", { error: "Invalid email or password." });
        }

        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
        };

        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        res.render("login", { error: "Login failed. Try again." });
    }
});

// -------------------- LOGOUT --------------------
router.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/login");
});

module.exports = router;
