const express = require("express");
const router = express.Router();
const { register, login, getMe, getNotifications, markNotificationsRead } = require("../controllers/authController");
const { updateProfile, updatePassword } = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/notifications", protect, getNotifications);
router.put("/notifications/read", protect, markNotificationsRead);

router.put("/profile", protect, upload.single("avatar"), updateProfile);
router.put("/password", protect, updatePassword);

module.exports = router;
