const express = require("express");
const router = express.Router();
const {
  getSpaces, getSpaceById, getMySpaces, createSpace, updateSpace, deleteSpace, addReview, deleteReview,
} = require("../controllers/spaceController");
const { protect, ownerOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/", getSpaces);
router.get("/owner/my-spaces", protect, ownerOnly, getMySpaces);
router.get("/:id", getSpaceById);
router.post("/", protect, ownerOnly, upload.array("images", 10), createSpace);
router.put("/:id", protect, ownerOnly, upload.array("images", 10), updateSpace);
router.delete("/:id", protect, deleteSpace);

router.post("/:id/reviews", protect, addReview);
router.delete("/:id/reviews/:reviewId", protect, deleteReview);

module.exports = router;
