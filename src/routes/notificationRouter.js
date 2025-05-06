const express = require("express");
const { auth } = require("../middlewares/auth");
const { PrismaClient } = require("@prisma/client");

const notificationRouter = express.Router();
const prisma = new PrismaClient();
// Get all notifications for current user
notificationRouter.get("/notications", auth, async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(notifications);
});

// Mark notification as read
notificationRouter.put("/notifications/:id/read", auth , async (req, res) => {
  const { id } = req.params;
  const updated = await prisma.notification.update({
    where: { id },
    data: { read: true },
  });
  res.json(updated);
});

module.exports = notificationRouter;
