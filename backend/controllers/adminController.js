const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// POST /api/admin/promote
const promoteToAdmin = async (req, res) => {
  try {
    const { email, adminSecret } = req.body;
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: "Clé secrète invalide" });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    user.role = "admin";
    await user.save();
    res.json({
      message: `${user.name} est maintenant Admin`,
      _id: user._id, name: user.name, email: user.email,
      role: user.role, token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/users/:id/block
const blockUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Vous ne pouvez pas vous bloquer vous-même" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    user.isBlocked = true;
    await user.save();
    res.json({ message: "Utilisateur bloqué", isBlocked: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/users/:id/unblock
const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    user.isBlocked = false;
    await user.save();
    res.json({ message: "Utilisateur débloqué", isBlocked: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["client", "owner", "admin"].includes(role)) {
      return res.status(400).json({ message: "Rôle invalide" });
    }
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Vous ne pouvez pas changer votre propre rôle" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    user.role = role;
    await user.save();
    res.json({ message: "Rôle mis à jour", role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    await user.deleteOne();
    res.json({ message: "Utilisateur supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/spaces
const getAllSpaces = async (req, res) => {
  try {
    const Space = require("../models/Space");
    const spaces = await Space.find({})
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });
    res.json(spaces);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/spaces/:id/validate
const validateSpace = async (req, res) => {
  try {
    const Space = require("../models/Space");
    const space = await Space.findById(req.params.id);
    if (!space) return res.status(404).json({ message: "Espace introuvable" });

    space.isValidated = true;
    space.isRefused = false;
    await space.save();

    const notifMessage = `Votre espace "${space.title}" a été validé et est maintenant visible !`;

    await User.findByIdAndUpdate(space.owner, {
      $push: {
        notifications: {
          type: "espace_valide",
          message: notifMessage,
          relatedId: space._id,
          createdAt: new Date(),
        },
      },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(space.owner.toString()).emit("notification", {
        type: "espace_valide",
        message: notifMessage,
        createdAt: new Date(),
      });
    }

    res.json({ message: "Espace validé", isValidated: true, isRefused: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/spaces/:id/refuse
const refuseSpace = async (req, res) => {
  try {
    const Space = require("../models/Space");
    const space = await Space.findById(req.params.id);
    if (!space) return res.status(404).json({ message: "Espace introuvable" });

    space.isValidated = false;
    space.isRefused = true;
    await space.save();

    const notifMessage = `Votre espace "${space.title}" a été refusé par l'administrateur. Veuillez le modifier et soumettre à nouveau.`;

    await User.findByIdAndUpdate(space.owner, {
      $push: {
        notifications: {
          type: "espace_refuse",
          message: notifMessage,
          relatedId: space._id,
          createdAt: new Date(),
        },
      },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(space.owner.toString()).emit("notification", {
        type: "espace_refuse",
        message: notifMessage,
        createdAt: new Date(),
      });
    }

    res.json({ message: "Espace refusé", isValidated: false, isRefused: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/spaces/:id/pending
const pendingSpace = async (req, res) => {
  try {
    const Space = require("../models/Space");
    const space = await Space.findById(req.params.id);
    if (!space) return res.status(404).json({ message: "Espace introuvable" });
    space.isValidated = false;
    space.isRefused = false;
    await space.save();
    res.json({ message: "Remis en attente", isValidated: false, isRefused: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/reservations
const getAllReservations = async (req, res) => {
  try {
    const Reservation = require("../models/Reservation");
    const reservations = await Reservation.find({})
      .populate("space", "title type location price")
      .populate("client", "name email phone")
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/payments
const getAllPayments = async (req, res) => {
  try {
    const Payment = require("../models/Payment");
    const payments = await Payment.find({})
      .populate("reservation", "date space status")
      .populate("client", "name email")
      .populate("owner", "name email")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  promoteToAdmin, getAllUsers, blockUser, unblockUser, updateUserRole, deleteUser,
  getAllSpaces, validateSpace, refuseSpace, pendingSpace,
  getAllReservations, getAllPayments,
};


