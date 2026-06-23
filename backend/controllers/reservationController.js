const Reservation = require("../models/Reservation");
const Space = require("../models/Space");
const User = require("../models/User");
const Payment = require("../models/Payment");

const addNotification = async (userId, type, message, relatedId) => {
  await User.findByIdAndUpdate(userId, {
    $push: { notifications: { type, message, relatedId } },
  });
};

// GET /api/reservations/space/:spaceId/booked-dates
// Renvoie toutes les dates déjà réservées (pending + accepted) pour un espace
const getBookedDates = async (req, res) => {
  try {
    const { spaceId } = req.params;
    const reservations = await Reservation.find({
      space: spaceId,
      status: { $in: ["pending", "accepted"] },
    }).select("date status");

    res.json(
      reservations.map((r) => ({
        date: r.date,
        status: r.status, // "pending" ou "accepted"
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/reservations
const createReservation = async (req, res) => {
  try {
    if (req.user.role === "owner") {
      return res.status(403).json({ message: "Les propriétaires ne peuvent pas effectuer de réservation" });
    }

    const { spaceId, date, endDate, guestCount, message } = req.body;

    const space = await Space.findById(spaceId).populate("owner");
    if (!space) return res.status(404).json({ message: "Espace introuvable" });
    if (!space.isValidated) return res.status(400).json({ message: "Cet espace n'est pas encore validé" });

    const requestedDate = new Date(date);
    requestedDate.setHours(0, 0, 0, 0);

    // Vérification stricte de disponibilité — bloque pending ET accepted
    const conflicting = await Reservation.findOne({
      space: spaceId,
      status: { $in: ["pending", "accepted"] },
      date: {
        $gte: requestedDate,
        $lt: new Date(requestedDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });
    if (conflicting) {
      return res.status(400).json({
        message:
          conflicting.status === "accepted"
            ? "Cette date n'est plus disponible — l'espace est déjà réservé."
            : "Cette date a déjà une demande de réservation en attente.",
      });
    }

    const totalPrice = space.price;

    const reservation = await Reservation.create({
      space: spaceId,
      client: req.user._id,
      owner: space.owner._id,
      date: requestedDate,
      endDate: endDate ? new Date(endDate) : null,
      guestCount: Number(guestCount),
      totalPrice,
      message: message || "",
    });

    await addNotification(
      space.owner._id,
      "nouvelle_reservation",
      `Nouvelle réservation pour "${space.title}" le ${requestedDate.toLocaleDateString("fr-FR")}`,
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
      .populate("client", "name email phone")
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

    const isClient = reservation.client._id.toString() === req.user._id.toString();
    const isOwner = reservation.owner._id.toString() === req.user._id.toString();

    if (["accepted", "refused"].includes(status)) {
      if (!isOwner) {
        return res.status(403).json({ message: "Non autorisé" });
      }
    } else if (status === "cancelled") {
      // Le client peut annuler sa réservation, le propriétaire peut aussi annuler
      // une réservation déjà acceptée (ex: empêchement) — le paiement est alors
      // remboursé/annulé en cascade ci-dessous.
      if (!isClient && !isOwner) {
        return res.status(403).json({ message: "Non autorisé" });
      }
    }

    // Si on accepte cette réservation, refuser automatiquement les autres demandes
    // "pending" sur la même date pour le même espace
    if (status === "accepted") {
      const others = await Reservation.find({
        space: reservation.space._id,
        date: reservation.date,
        status: "pending",
        _id: { $ne: reservation._id },
      }).populate("client", "name");

      for (const other of others) {
        other.status = "refused";
        other.cancellationReason = "Date attribuée à une autre réservation";
        await other.save();
        await addNotification(
          other.client._id,
          "reservation_refused",
          `Votre réservation pour "${reservation.space.title}" a été refusée — la date n'est plus disponible.`,
          other._id
        );
      }
    }

    reservation.status = status;
    if (cancellationReason) reservation.cancellationReason = cancellationReason;
    await reservation.save();

    // Si la réservation est annulée et qu'un paiement est en cours ou confirmé,
    // on l'annule (pas encore confirmé) ou on le rembourse (déjà confirmé) en cascade.
    if (status === "cancelled") {
      const payment = await Payment.findOne({
        reservation: reservation._id,
        status: { $in: ["pending", "confirmed"] },
      });
      if (payment) {
        const wasConfirmed = payment.status === "confirmed";
        payment.status = wasConfirmed ? "refunded" : "cancelled";
        payment.cancellationReason = "Réservation annulée";
        await payment.save();

        await addNotification(
          payment.client,
          wasConfirmed ? "paiement_refunded" : "paiement_cancelled",
          wasConfirmed
            ? `Le paiement de ${payment.amount} MAD pour "${reservation.space.title}" a été remboursé suite à l'annulation de la réservation.`
            : `Votre paiement en attente de ${payment.amount} MAD pour "${reservation.space.title}" a été annulé suite à l'annulation de la réservation.`,
          reservation._id
        );
      }
    }

    const notifMsg = {
      accepted: `Votre réservation pour "${reservation.space.title}" a été acceptée !`,
      refused: `Votre réservation pour "${reservation.space.title}" a été refusée.`,
      cancelled: isOwner
        ? `Votre réservation pour "${reservation.space.title}" a été annulée par le propriétaire.`
        : `La réservation pour "${reservation.space.title}" a été annulée.`,
    };

    const notifyUserId = status === "cancelled" ? (isOwner ? reservation.client._id : reservation.owner._id) : reservation.client._id;
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

    const isClient = reservation.client._id.toString() === req.user._id.toString();
    const isOwner = reservation.owner._id.toString() === req.user._id.toString();
    if (!isClient && !isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Non autorisé" });
    }

    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getOwnerReservations,
  updateReservationStatus,
  getReservationById,
  getBookedDates,
};
