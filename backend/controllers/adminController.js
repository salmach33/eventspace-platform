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
      message: `✅ ${user.name} est maintenant Admin`,
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

    const notifMessage = `Votre espace "${space.title}" a été validé et est maintenant visible ! ✅`;

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

    res.json({ message: "Espace validé ✅", isValidated: true, isRefused: false });
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

    const notifMessage = `Votre espace "${space.title}" a été refusé par l'administrateur. ❌ Veuillez le modifier et soumettre à nouveau.`;

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

    res.json({ message: "Espace refusé ❌", isValidated: false, isRefused: true });
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
    res.json({ message: "Remis en attente 🔄", isValidated: false, isRefused: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { promoteToAdmin, getAllUsers, getAllSpaces, validateSpace, refuseSpace, pendingSpace };