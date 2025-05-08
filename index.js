require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./src/routes/auth");
const taskRoutes = require("./src/routes/task");
const notificationRouter = require("./src/routes/notificationRouter");
const cookieParser = require("cookie-parser");

const app = express();



const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});



app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true,              
}));
app.use(express.json());


app.use(cookieParser());

app.use("/", authRoutes);
app.use("/", taskRoutes);
app.use("/", notificationRouter);
app.set("io", io);

// Handle socket connections
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
