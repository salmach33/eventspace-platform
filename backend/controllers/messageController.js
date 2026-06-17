const Message = require("../models/Message");
const User = require("../models/User");

// GET /api/messages/:spaceId/:userId - get conversation
const getConversation = async (req, res) => {
  try {
    const { spaceId, userId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      space: spaceId,
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId },
      ],
    })
      .populate("sender", "name avatar role")
      .populate("receiver", "name avatar role")
      .sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      { space: spaceId, sender: userId, receiver: myId, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/messages/conversations - list all conversations for user
const getConversations = async (req, res) => {
  try {
    const myId = req.user._id;

    // Get latest message per unique (space, partner) combination
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: myId }, { receiver: myId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            space: "$space",
            partner: {
              $cond: [{ $eq: ["$sender", myId] }, "$receiver", "$sender"],
            },
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$receiver", myId] }, { $eq: ["$read", false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    // Populate
    const populated = await Message.populate(messages, [
      { path: "lastMessage.sender", select: "name avatar" },
      { path: "lastMessage.receiver", select: "name avatar" },
      { path: "_id.space", model: "Space", select: "title images" },
      { path: "_id.partner", model: "User", select: "name avatar role" },
    ]);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/messages (REST fallback)
const sendMessage = async (req, res) => {
  try {
    const { spaceId, receiverId, content } = req.body;

    const msg = await Message.create({
      space: spaceId,
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    // Notify receiver
    await User.findByIdAndUpdate(receiverId, {
      $push: {
        notifications: {
          type: "nouveau_message",
          message: `Nouveau message de ${req.user.name}`,
          relatedId: msg._id,
        },
      },
    });

    const populated = await msg.populate([
      { path: "sender", select: "name avatar role" },
      { path: "receiver", select: "name avatar role" },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getConversation, getConversations, sendMessage };
