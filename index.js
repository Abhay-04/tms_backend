require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/auth");
const taskRoutes = require("./src/routes/task");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cors());
app.use(express.json());


app.use(cookieParser());

app.use("/", authRoutes);
app.use("/", taskRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
