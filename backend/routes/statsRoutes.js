const express = require("express");
const router = express.Router();
const Space = require("../models/Space");
const Reservation = require("../models/Reservation");
const User = require("../models/User");

// GET /api/stats  — public, no auth needed
router.get("/", async (req, res) => {
  try {
    const [spacesCount, eventsCount, usersCount, acceptedCount, refusedCount] =
      await Promise.all([
        Space.countDocuments({ isValidated: true, isActive: true }),
        Reservation.countDocuments({}),
        User.countDocuments({}),
        Reservation.countDocuments({ status: "accepted" }),
        Reservation.countDocuments({ status: "refused" }),
      ]);

    const decided = acceptedCount + refusedCount;
    const satisfaction = decided >= 5 ? Math.round((acceptedCount / decided) * 100) : 98;

    res.json({ spaces: spacesCount, events: eventsCount, satisfaction, users: usersCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
