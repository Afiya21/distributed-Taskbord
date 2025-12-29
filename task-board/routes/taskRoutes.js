const express = require("express");
const Task = require("../models/Task");
const { isAuthenticated, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// ADMIN: Create a new task
router.post("/", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        const task = new Task({
            title,
            description,
            createdBy: req.session.user.id
        });

        await task.save();

        // Emit real-time event
        req.app.get("io").emit("taskCreated", task);

        res.status(201).json(task);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// USER: Get all tasks
router.get("/", isAuthenticated, async (req, res) => {
    try {
        const tasks = await Task.find().populate("createdBy", "name email");
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// USER: Update task status
router.put("/:id", isAuthenticated, async (req, res) => {
    try {
        const { status } = req.body;

        if (!["todo", "in-progress", "done"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }


        task.status = status;
        await task.save();

        // Emit real-time event WITH user info
        req.app.get("io").emit("taskUpdated", {
            taskId: task._id,
            title: task.title,
            status: task.status,
            updatedBy: req.session.user.name
        });

        res.json(task);


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
