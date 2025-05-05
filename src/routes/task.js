const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { auth } = require("../middlewares/auth");

const prisma = new PrismaClient();
const taskRouter = express.Router();

taskRouter.get("/", auth, async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { createdById: req.user.id },
        { assignedToId: req.user.id },
      ],
    },
    include: { createdBy: true, assignedTo: true },
  });
  res.json(tasks);
});

taskRouter.post("/", auth, async (req, res) => {
  const { title, description, dueDate, priority, status, assignedToId } = req.body;
  const task = await prisma.task.create({
    data: {
      title,
      description,
      dueDate: new Date(dueDate),
      priority,
      status,
      createdById: req.user.id,
      assignedToId,
    },
  });
  res.json(task);
});

// Add PUT and DELETE routes similarly

module.exports = taskRouter;
