const Reservation = require("../models/Reservation");
const Space = require("../models/Space");
const User = require("../models/User");

const addNotification = async (userId, type, message, relatedId) => {
  await User.findByIdAndUpdate(userId, {
    $push: { notifications: { type, message, relatedId } },
  });
};

// POST /api/reservations
const createReservation = async (req, res) => {
  try {
    const { spaceId, date, endDate, guestCount, message } = req.body;

    const space = await Space.findById(spaceId).populate("owner");
    if (!space) return res.status(404).json({ message: "Espace introuvable" });
    if (!space.isValidated) return res.status(400).json({ message: "Cet espace n'est pas encore validé" });

    // Check availability
    const conflicting = await Reservation.findOne({
      space: spaceId,
      date: new Date(date),
      status: { $in: ["pending", "accepted"] },
    });
    if (conflicting) return res.status(400).json({ message: "Cet espace est déjà réservé pour cette date" });

    const totalPrice = space.price;

    const reservation = await Reservation.create({
      space: spaceId,
      client: req.user._id,
      owner: space.owner._id,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      guestCount: Number(guestCount),
      totalPrice,
      message: message || "",
    });

    // Notify owner
    await addNotification(
      space.owner._id,
      "nouvelle_reservation",
      `Nouvelle réservation pour "${space.title}" le ${new Date(date).toLocaleDateString("fr-FR")}`,
      reservation._id
    );

    const populated = await Reservation.findById(reservation._id)
      .populate("space", "title images price location")
      .populate("client", "name email phone")
      .populate("owner", "name email");

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reservations/my - client
const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ client: req.user._id })
      .populate("space", "title images price location type")
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reservations/owner - owner
const getOwnerReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ owner: req.user._id })
      .populate("space", "title images price location type")
      .populate("client", "name email phone")
      .sort({ createdAt: -1 });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/reservations/:id/status
const updateReservationStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    const reservation = await Reservation.findById(req.params.id)
      .populate("space", "title")
      .populate("client", "name")
      .populate("owner", "name");

    if (!reservation) return res.status(404).json({ message: "Réservation introuvable" });

    // Only owner can accept/refuse, client can cancel
    if (["accepted", "refused"].includes(status)) {
      if (reservation.owner._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Non autorisé" });
      }
    } else if (status === "cancelled") {
      if (reservation.client._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Non autorisé" });
      }
    }

    reservation.status = status;
    if (cancellationReason) reservation.cancellationReason = cancellationReason;
    await reservation.save();

    // Notify client
    const notifMsg = {
      accepted: `Votre réservation pour "${reservation.space.title}" a été acceptée ! 🎉`,
      refused: `Votre réservation pour "${reservation.space.title}" a été refusée.`,
      cancelled: `La réservation pour "${reservation.space.title}" a été annulée.`,
    };

    const notifyUserId = status === "cancelled" ? reservation.owner._id : reservation.client._id;
    await addNotification(notifyUserId, `reservation_${status}`, notifMsg[status], reservation._id);

    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reservations/:id
const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate("space", "title images price location type")
      .populate("client", "name email phone avatar")
      .populate("owner", "name email phone avatar");
    if (!reservation) return res.status(404).json({ message: "Réservation introuvable" });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createReservation, getMyReservations, getOwnerReservations, updateReservationStatus, getReservationById };
