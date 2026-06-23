const User = require("../models/User");
const bcrypt = require("bcryptjs");

// PUT /api/auth/profile — modifier nom, email, avatar
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    const { name, email, phone } = req.body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    if (email && email !== user.email) {
      const exists = await User.findOne({ email, _id: { $ne: user._id } });
      if (exists) return res.status(400).json({ message: "Cet email est déjà utilisé" });
      user.email = email;
    }

    // Nouvelle photo de profil uploadée
    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/auth/password — changer le mot de passe
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Mot de passe actuel et nouveau requis" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Le nouveau mot de passe doit faire au moins 6 caractères" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    const match = await user.matchPassword(currentPassword);
    if (!match) return res.status(401).json({ message: "Mot de passe actuel incorrect" });

    user.password = newPassword; // le hook pre('save') du modèle hash automatiquement
    await user.save();

    res.json({ message: "Mot de passe modifié avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { updateProfile, updatePassword };
