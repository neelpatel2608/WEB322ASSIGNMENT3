/**************************************************************
* File Name: routes/tasks.js
* Author: Neel S Patel
* Course: WEB322
* Seneca Email: nspatel55@myseneca.ca
* Date: December 2, 2025
*
* Description:
*   Handles all task-related routes
**************************************************************/

console.log("✔ tasks.js LOADED");

const express = require("express");
const auth = require("../middleware/auth");
const Task = require("../models/Task");

const router = express.Router();

// -------------------- DASHBOARD -------------------- //
router.get("/dashboard", auth, async (req, res) => {
    const user = req.session.user;

    const taskCount = await Task.count({ where: { userId: user.id } });
    const completedCount = await Task.count({
        where: { userId: user.id, status: "completed" },
    });

    res.render("dashboard", {
        user,
        taskCount,
        completedCount,
    });
});

// -------------------- SHOW ALL TASKS -------------------- //
router.get("/tasks", auth, async (req, res) => {
    const tasks = await Task.findAll({
        where: { userId: req.session.user.id },
        order: [["id", "ASC"]],
    });

    // Convert to plain objects so Handlebars can read them
    const plainTasks = tasks.map(task => task.get({ plain: true }));

    res.render("tasks", { tasks: plainTasks });
});

// -------------------- ADD TASK FORM -------------------- //
router.get("/tasks/add", auth, (req, res) => {
    res.render("tasks-add");
});

// -------------------- CREATE TASK -------------------- //
router.post("/tasks/add", auth, async (req, res) => {
    await Task.create({
        title: req.body.title,
        description: req.body.description,
        dueDate: req.body.dueDate,
        status: "pending",
        userId: req.session.user.id,
    });

    res.redirect("/tasks");
});

// -------------------- EDIT TASK FORM -------------------- //
router.get("/tasks/edit/:id", auth, async (req, res) => {
    const taskInstance = await Task.findByPk(req.params.id);

    if (!taskInstance) return res.redirect("/tasks");

    const task = taskInstance.get({ plain: true });

    res.render("tasks-edit", { task });
});

// -------------------- UPDATE TASK -------------------- //
router.post("/tasks/edit/:id", auth, async (req, res) => {
    await Task.update(
        {
            title: req.body.title,
            description: req.body.description,
            dueDate: req.body.dueDate,
        },
        { where: { id: req.params.id } }
    );

    res.redirect("/tasks");
});

// -------------------- DELETE TASK -------------------- //
router.post("/tasks/delete/:id", auth, async (req, res) => {
    await Task.destroy({ where: { id: req.params.id } });
    res.redirect("/tasks");
});

// -------------------- CHANGE STATUS -------------------- //
router.post("/tasks/status/:id", auth, async (req, res) => {
    const task = await Task.findByPk(req.params.id);

    if (!task) return res.redirect("/tasks");

    const newStatus = task.status === "pending" ? "completed" : "pending";

    await Task.update(
        { status: newStatus },
        { where: { id: req.params.id } }
    );

    res.redirect("/tasks");
});

module.exports = router;
