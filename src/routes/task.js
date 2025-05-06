const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { auth, checkRole } = require("../middlewares/auth");

const prisma = new PrismaClient();
const taskRouter = express.Router();

// GET-TASK
taskRouter.get("/get-task", auth, async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: {
      OR: [{ createdById: req.user.id }, { assignedToId: req.user.id }],
    },
    include: { createdBy: true, assignedTo: true },
  });
  res.json(tasks);
});

// CREATE-TASK
taskRouter.post("/create-task", auth, async (req, res) => {
  const { title, description, dueDate, priority, status, assignedToId } =
    req.body;

  const parseDateFromDDMMYYYY = (dateStr) => {
    const [day, month, year] = dateStr.split("-");
    if (!day || !month || !year) return null;
    const isoString = `${year}-${month}-${day}T00:00:00Z`;
    const date = new Date(isoString);
    return isNaN(date) ? null : date;
  };

  const parsedDueDate = parseDateFromDDMMYYYY(dueDate);
  if (!parsedDueDate) {
    return res
      .status(400)
      .json({ error: "Invalid date format. Use DD-MM-YYYY" });
  }



  const task = await prisma.task.create({
    data: {
      title,
      description,
      dueDate: parsedDueDate,
      priority,
      status,
      createdById: req.user.id,
      assignedToId,
    },
  });
  res.json(task);
});

// DELETE-TASK
taskRouter.delete("/delete/:id", auth, checkRole("ADMIN"), async (req, res) => {
  const taskId = req.params.id;
  try {
    await prisma.task.delete({ where: { id: taskId } });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(404).json({ error: "Task not found" });
  }
});

// UPDATE-TASK
taskRouter.put("/update/:id", auth, async (req, res) => {
  const taskId = req.params.id;
  const existingTask = await prisma.task.findUnique({ where: { id: taskId } });

  if (!existingTask) return res.status(404).json({ error: "Task not found" });

  if (req.user.role !== "ADMIN" && req.user.id !== existingTask.createdById) {
    return res.status(403).json({ error: "Not allowed" });
  }

  const { title, description, dueDate, priority, status, assignedToId } = req.body;

  // Parse due date only if provided
  let parsedDueDate;
  if (dueDate) {
    const [day, month, year] = dueDate.split("-");
    const isoString = `${year}-${month}-${day}T00:00:00Z`;
    parsedDueDate = new Date(isoString);
    if (isNaN(parsedDueDate)) {
      return res
        .status(400)
        .json({ error: "Invalid date format. Use DD-MM-YYYY" });
    }
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(dueDate && { dueDate: parsedDueDate }),
      ...(priority && { priority }),
      ...(status && { status }),
      ...(assignedToId && { assignedToId }),
    },
  });

  res.json(updated);
});


module.exports = taskRouter;
