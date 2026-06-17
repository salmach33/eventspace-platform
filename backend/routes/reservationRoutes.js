const express = require("express");
const router = express.Router();
const {
  createReservation, getMyReservations, getOwnerReservations, updateReservationStatus, getReservationById,
} = require("../controllers/reservationController");
const { protect, ownerOnly } = require("../middleware/authMiddleware");

router.post("/", protect, createReservation);
router.get("/my", protect, getMyReservations);
router.get("/owner", protect, ownerOnly, getOwnerReservations);
router.get("/:id", protect, getReservationById);
router.put("/:id/status", protect, updateReservationStatus);

module.exports = router;
