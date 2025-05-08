# 🗂️ Task Management System - Backend

This is the backend for a Task Management System built using **Node.js**, **Express.js**, **Prisma**, and **PostgreSQL**. It includes:

- User Authentication (Signup/Login with JWT)
- Role-Based Access Control (Admin, Manager, User)
- Task CRUD Operations (title, description, due date, priority, status)
- Team Collaboration (assign tasks to users)
- Real-Time Notifications using Socket.IO
- Protected APIs using middleware

---

## 📦 Tech Stack

- **Node.js + Express.js** — REST API
- **Prisma ORM** — PostgreSQL database interaction
- **PostgreSQL** — Database
- **JWT + Cookies** — Secure authentication
- **Socket.IO** — Real-time notifications
- **CORS ** — Secure headers & cross-origin support

---
# ✅ API Endpoints

## 🔐 Auth
* `POST /signup` — Register a new user (Admin/Manager/User)
* `POST /login` — Login and receive JWT in cookies
* `POST /logout` — Logout and remove JWT from cookies

## 📋 Tasks
* `POST /create-task` — Create a task
* `GET /get-task` — Get tasks for logged-in user
* `PUT /update/:id` — Update a task
* `DELETE /delete/:id` — Delete a task
* `GET /dashboard-tasks` — Dashboard task 

## 🔔 Notifications
* `GET /notifications` — Get user notifications
* `PUT /notifications/:id/read` — Mark notification as read


## 🔒 Middleware
* `auth` — Verifies JWT from cookies
* `checkRole('ADMIN')` — Restrict access by role


# 🔧 Future Features (Ideas)

* Email notifications
* Task comments or chat
* Recurring task automation (daily, weekly, monthly)
* Multi-team (SaaS-like) organization structure
* Pagination, filtering, search


# 🚀 Setup & Installation Guide

Follow the steps below to clone and run the backend server for the Task Management System.

---

## ✅ Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [PostgreSQL](https://www.postgresql.org/) installed and running
- [Git](https://git-scm.com/) installed

---

# 🚀 Setup & Installation

## Prerequisites
* Node.js (v16+)
* MongoDB
* npm or yarn

## Clone & Setup
```bash
# Clone the repository
git clone https://github.com/Abhay-04/tms_backend

# Navigate to project directory
cd project-name

# Install dependencies
npm install
# or
yarn install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# DB_URI=mongodb://localhost:27017/your-db
# JWT_SECRET=your-secret-key
# etc...

# Run development server
npm run dev
# or
yarn dev

## Issues

Feel free to submit issues and enhancement requests using the Issues tab on GitHub.