import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/messages.js";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config(); // Initialize dotenv

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
await mongoose
  .connect("mongodb://127.0.0.1:27017", {})
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.error(err.message);
  });

// Routes
app.get("/ping", (_req, res) => {
  return res.json({ msg: "Ping Successful" });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Start Server
const server = app.listen(process.env.PORT || 5000, () => {
  console.log(`Server started on ${process.env.PORT || 5000}`);
});

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;

  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});
