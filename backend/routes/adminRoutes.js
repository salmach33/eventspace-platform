const express = require("express");
const router = express.Router();
const {
  promoteToAdmin, getAllUsers, getAllSpaces, validateSpace, refuseSpace, pendingSpace,
  getAllReservations, getAllPayments,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/promote", promoteToAdmin);
router.get("/users", protect, adminOnly, getAllUsers);
router.get("/spaces", protect, adminOnly, getAllSpaces);
router.put("/spaces/:id/validate", protect, adminOnly, validateSpace);
router.put("/spaces/:id/refuse", protect, adminOnly, refuseSpace);
router.put("/spaces/:id/pending", protect, adminOnly, pendingSpace);
router.get("/reservations", protect, adminOnly, getAllReservations);
router.get("/payments", protect, adminOnly, getAllPayments);

module.exports = router;
