const express = require("express");

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { signUpDataValidation } = require("../utils/validation");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const authRouter = express.Router();

// Register
authRouter.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation of data

    signUpDataValidation(req);

    //Encrypt the password
    const hashPassword = await bcrypt.hash(password, 10);

    // create a user instance
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
        role: role || "USER",
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set token in HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,

      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Login
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid email" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Invalid password" });

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  // Set token in cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    
  });

  res.json({ token, user });
});



// logout
authRouter.post("/logout", async (req, res) => {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true, // Required for HTTPS
      sameSite: "None", // Required for cross-origin requests
    });
  
    res.send("Logout Successful.....");
  });

module.exports = authRouter;
