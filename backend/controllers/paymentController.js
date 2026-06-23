const Payment = require("../models/Payment");
const Reservation = require("../models/Reservation");
const User = require("../models/User");

const addNotification = async (userId, type, message, relatedId) => {
  await User.findByIdAndUpdate(userId, {
    $push: { notifications: { type, message, relatedId } },
  });
};

// POST /api/payments - le client déclare avoir payé une réservation acceptée
const createPayment = async (req, res) => {
  try {
    const { reservationId, method } = req.body;

    const reservation = await Reservation.findById(reservationId).populate("space", "title");
    if (!reservation) return res.status(404).json({ message: "Réservation introuvable" });

    if (reservation.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Non autorisé" });
    }
    if (reservation.status !== "accepted") {
      return res.status(400).json({ message: "Le paiement n'est possible que pour une réservation acceptée" });
    }

    const existing = await Payment.findOne({
      reservation: reservationId,
      status: { $in: ["pending", "confirmed"] },
    });
    if (existing) {
      return res.status(400).json({ message: "Un paiement existe déjà pour cette réservation" });
    }

    const payment = await Payment.create({
      reservation: reservationId,
      client: reservation.client,
      owner: reservation.owner,
      amount: reservation.totalPrice,
      method: method || "virement",
    });

    await addNotification(
      reservation.owner,
      "nouveau_paiement",
      `Un paiement de ${reservation.totalPrice} MAD a été déclaré pour "${reservation.space.title}". Merci de confirmer la réception.`,
      reservation._id
    );

    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/payments/my - paiements effectués par le client
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ client: req.user._id })
      .populate("reservation", "date space status")
      .populate("owner", "name email")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/payments/owner - paiements reçus par le propriétaire
const getOwnerPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ owner: req.user._id })
      .populate("reservation", "date space status")
      .populate("client", "name email")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/payments/reservation/:reservationId
const getPaymentByReservation = async (req, res) => {
  try {
    const payment = await Payment.findOne({ reservation: req.params.reservationId }).sort({ createdAt: -1 });
    if (!payment) return res.status(404).json({ message: "Aucun paiement trouvé" });

    const isClient = payment.client.toString() === req.user._id.toString();
    const isOwner = payment.owner.toString() === req.user._id.toString();
    if (!isClient && !isOwner) return res.status(403).json({ message: "Non autorisé" });

    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/payments/:id/cancel - le client annule son paiement avant confirmation
const cancelPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Paiement introuvable" });

    if (payment.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Non autorisé" });
    }
    if (payment.status !== "pending") {
      return res.status(400).json({ message: "Ce paiement ne peut plus être annulé" });
    }

    payment.status = "cancelled";
    if (req.body.cancellationReason) payment.cancellationReason = req.body.cancellationReason;
    await payment.save();

    await addNotification(
      payment.owner,
      "paiement_cancelled",
      `Le client a annulé son paiement de ${payment.amount} MAD.`,
      payment.reservation
    );

    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/payments/:id/reject - le propriétaire refuse le paiement (motif obligatoire)
// Le client pourra alors refaire un paiement (statut "cancelled" libère la réservation)
const rejectPayment = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Le motif du refus est obligatoire" });
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Paiement introuvable" });

    if (payment.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Non autorisé" });
    }
    if (payment.status !== "pending") {
      return res.status(400).json({ message: "Ce paiement ne peut plus être refusé" });
    }

    payment.status = "cancelled";
    payment.cancellationReason = reason.trim();
    await payment.save();

    await addNotification(
      payment.client,
      "paiement_rejected",
      `Votre paiement de ${payment.amount} MAD a été refusé par le propriétaire : "${payment.cancellationReason}". Vous pouvez effectuer un nouveau paiement.`,
      payment.reservation
    );

    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/payments/:id/confirm - le propriétaire confirme avoir reçu le paiement
const confirmPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Paiement introuvable" });

    if (payment.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Non autorisé" });
    }
    if (payment.status !== "pending") {
      return res.status(400).json({ message: "Ce paiement ne peut plus être confirmé" });
    }

    payment.status = "confirmed";
    await payment.save();

    await addNotification(
      payment.client,
      "paiement_confirme",
      `Votre paiement de ${payment.amount} MAD a été confirmé par le propriétaire.`,
      payment.reservation
    );

    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createPayment,
  getMyPayments,
  getOwnerPayments,
  getPaymentByReservation,
  cancelPayment,
  rejectPayment,
  confirmPayment,
};
