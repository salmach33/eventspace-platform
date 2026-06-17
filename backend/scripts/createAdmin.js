const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const ADMIN = {
  name: "Super Admin",
  email: "admin@eventspace.ma",
  password: "Admin@2024",
};

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "client" },
  notifications: { type: Array, default: [] },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    const exists = await User.findOne({ email: ADMIN.email });
    if (exists) {
      exists.role = "admin";
      await exists.save();
      console.log("✅ Promu Admin :", ADMIN.email);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(ADMIN.password, salt);
    await User.create({ ...ADMIN, password: hashed, role: "admin" });

    console.log("🎉 Admin créé !");
    console.log("Email    :", ADMIN.email);
    console.log("Password :", ADMIN.password);
  } catch (err) {
    console.error("❌ Erreur :", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();