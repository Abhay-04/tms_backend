const express = require("express");
const { auth } = require("../middlewares/auth");
const { PrismaClient } = require("@prisma/client");

const notificationRouter = express.Router();
const prisma = new PrismaClient();
// Get all notifications for current user
notificationRouter.get("/notifications", auth, async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(notifications);
});

// Mark notification as read
notificationRouter.put("/notifications/:id/read", auth, async (req, res) => {
    const { id } = req.params;
  
    try {
      // Check if notification exists
      const existing = await prisma.notification.findUnique({ where: { id } });
  
      if (!existing) {
        return res.status(404).json({ error: "Notification not found" });
      }
  
      const updated = await prisma.notification.update({
        where: { id },
        data: { read: true },
      });
  
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "An error occurred while updating notification" });
    }
  });
  

module.exports = notificationRouter;
