const express = require("express");
const router = express.Router();
const {
  createPayment, getMyPayments, getOwnerPayments,
  getPaymentByReservation, cancelPayment, rejectPayment, confirmPayment,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createPayment);
router.get("/my", protect, getMyPayments);
router.get("/owner", protect, getOwnerPayments);
router.get("/reservation/:reservationId", protect, getPaymentByReservation);
router.put("/:id/cancel", protect, cancelPayment);
router.put("/:id/reject", protect, rejectPayment);
router.put("/:id/confirm", protect, confirmPayment);

module.exports = router;
