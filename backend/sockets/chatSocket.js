const Message = require("../models/Message");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Map userId -> socketId
const onlineUsers = new Map();

const setupSocket = (io) => {
  // Auth middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} connected`);

    // Broadcast online users
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));

    // Join personal room
    socket.join(userId);

    // ----- MESSAGING -----
    socket.on("sendMessage", async (data) => {
      try {
        const { spaceId, receiverId, content } = data;

        const msg = await Message.create({
          space: spaceId,
          sender: userId,
          receiver: receiverId,
          content,
        });

        const populated = await msg.populate([
          { path: "sender", select: "name avatar role" },
          { path: "receiver", select: "name avatar role" },
        ]);

        // Send to receiver if online
        io.to(receiverId).emit("newMessage", populated);
        // Send back to sender
        socket.emit("newMessage", populated);

        // Push notification to receiver
        const sender = await User.findById(userId).select("name");
        await User.findByIdAndUpdate(receiverId, {
          $push: {
            notifications: {
              type: "nouveau_message",
              message: `Nouveau message de ${sender.name}`,
              relatedId: msg._id,
            },
          },
        });

        // Emit notification event to receiver's room
        io.to(receiverId).emit("notification", {
          type: "nouveau_message",
          message: `Nouveau message de ${sender.name}`,
          relatedId: msg._id,
        });
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // ----- TYPING -----
    socket.on("typing", ({ receiverId, spaceId }) => {
      io.to(receiverId).emit("userTyping", { senderId: userId, spaceId });
    });

    socket.on("stopTyping", ({ receiverId, spaceId }) => {
      io.to(receiverId).emit("userStopTyping", { senderId: userId, spaceId });
    });

    // ----- DISCONNECT -----
    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      console.log(`User ${userId} disconnected`);
    });
  });
};

module.exports = setupSocket;
