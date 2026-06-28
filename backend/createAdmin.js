const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const ADMIN = {
  name: "Administrateur",
  email: "admin@eventspace.ma",
  password: "Admin@1234",
  role: "admin",
};

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connecté");

  const User = require("./models/User");

  const existing = await User.findOne({ email: ADMIN.email });
  if (existing) {
    // Assign plain password — pre("save") hook will hash it
    existing.role = "admin";
    existing.password = ADMIN.password;
    await existing.save();
    console.log("✔  Compte admin mis à jour (mot de passe réinitialisé)");
  } else {
    // User.create triggers pre("save") which hashes the password
    await User.create(ADMIN);
    console.log("✔  Compte admin créé avec succès !");
  }

  console.log("   Email    :", ADMIN.email);
  console.log("   Password :", ADMIN.password);

  await mongoose.disconnect();
}

createAdmin().catch((err) => {
  console.error("Erreur :", err.message);
  process.exit(1);
});
