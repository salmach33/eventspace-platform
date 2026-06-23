const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

const formatUser = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || "",
  avatar: user.avatar || "",
  token,
});


// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email déjà utilisé" });

    const allowedRoles = ["client", "owner"];
    const userRole = allowedRoles.includes(role) ? role : "client";

    const user = await User.create({ name, email, password, role: userRole });
    res.status(201).json(formatUser(user, generateToken(user._id)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    res.json(formatUser(user, generateToken(user._id)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/notifications
const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("notifications");
    res.json(user.notifications.sort((a, b) => b.createdAt - a.createdAt));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/auth/notifications/read
const markNotificationsRead = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user._id },
      { $set: { "notifications.$[].read": true } }
    );
    res.json({ message: "Notifications marquées comme lues" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, getMe, getNotifications, markNotificationsRead };
