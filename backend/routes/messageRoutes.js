const express = require("express");
const router = express.Router();
const { getConversation, getConversations, sendMessage } = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

router.get("/conversations", protect, getConversations);
router.get("/:spaceId/:userId", protect, getConversation);
router.post("/", protect, sendMessage);

module.exports = router;
