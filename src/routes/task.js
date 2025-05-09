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

  if (assignedToId) {
    const creator = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    

    // Save notification to DB
    await prisma.notification.create({
      data: {
        userId: assignedToId,
        message: `You have been assigned a new task ${title} by ${creator.name}`,
        taskId: task.id,
      },
    });

    // Send real-time notification
    const io = req.app.get("io");
    io.to(assignedToId).emit("task-assigned", {
      message: `New task assigned: ${title}`,
      task,
    });
  }

  res.json(task);
});

// DELETE-TASK
taskRouter.delete("/delete/:id", auth, async (req, res) => {
  const taskId = req.params.id;

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // If not admin, ensure user is the creator
    if (req.user.role !== "ADMIN" && task.createdById !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to delete this task" });
    }

    await prisma.task.delete({ where: { id: taskId } });
    res.json({ message: "Task deleted" });

  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// UPDATE-TASK
taskRouter.put("/update/:id", auth, async (req, res) => {
  const taskId = req.params.id;
  const existingTask = await prisma.task.findUnique({ where: { id: taskId } });

  if (!existingTask) return res.status(404).json({ error: "Task not found" });

  // Only ADMIN, task creator, or assignee can update the task
  const isAdmin = req.user.role === "ADMIN";
  const isCreator = req.user.id === existingTask.createdById;
  const isAssignee = req.user.id === existingTask.assignedToId;

  if (!isAdmin && !isCreator && !isAssignee) {
    return res.status(403).json({ error: "Not authorized to update this task" });
  }

  const { title, description, dueDate, priority, status, assignedToId } = req.body;

  // Parse due date only if provided
  let parsedDueDate;
  if (dueDate) {
    const [day, month, year] = dueDate.split("-");
    const isoString = `${year}-${month}-${day}T00:00:00Z`;
    parsedDueDate = new Date(isoString);
    if (isNaN(parsedDueDate)) {
      return res.status(400).json({ error: "Invalid date format. Use DD-MM-YYYY" });
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
      ...(assignedToId !== undefined && { assignedToId }), // allow null
    },
  });

  res.json(updated);
});


taskRouter.get("/dashboard-tasks", auth , async (req, res) => {
  const userId = req.user.id; 
 

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  try {
    const [assignedTasks, createdTasks, overdueTasks] = await Promise.all([
      prisma.task.findMany({
        where: { assignedToId: userId },
        orderBy: { createdAt: "asc" }
      }),
      prisma.task.findMany({
        where: { createdById: userId },
        orderBy: { createdAt: "desc" }
      }),
      prisma.task.findMany({
        where: {
          assignedToId: userId,
          dueDate: { lt: today },
          status: { not: "COMPLETED" }
        },
        orderBy: { dueDate: "asc" }
      }),
    ]);

    res.json({ assignedTasks, createdTasks, overdueTasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard tasks" });
  }
});

  taskRouter.get("/users", auth ,  async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true, // or 'email' if you prefer
      },
    });

    res.json(users);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


module.exports = taskRouter;
