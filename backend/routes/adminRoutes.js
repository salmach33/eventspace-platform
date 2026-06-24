const express = require("express");
const router = express.Router();
const {
  promoteToAdmin, getAllUsers, blockUser, unblockUser, updateUserRole, deleteUser,
  getAllSpaces, validateSpace, refuseSpace, pendingSpace,
  getAllReservations, getAllPayments,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/promote", promoteToAdmin);
router.get("/users", protect, adminOnly, getAllUsers);
router.put("/users/:id/block", protect, adminOnly, blockUser);
router.put("/users/:id/unblock", protect, adminOnly, unblockUser);
router.put("/users/:id/role", protect, adminOnly, updateUserRole);
router.delete("/users/:id", protect, adminOnly, deleteUser);
router.get("/spaces", protect, adminOnly, getAllSpaces);
router.put("/spaces/:id/validate", protect, adminOnly, validateSpace);
router.put("/spaces/:id/refuse", protect, adminOnly, refuseSpace);
router.put("/spaces/:id/pending", protect, adminOnly, pendingSpace);
router.get("/reservations", protect, adminOnly, getAllReservations);
router.get("/payments", protect, adminOnly, getAllPayments);

module.exports = router;
