const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
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
    const salt = await bcrypt.genSalt(10);
    existing.role = "admin";
    existing.password = await bcrypt.hash(ADMIN.password, salt);
    await existing.save();
    console.log("✔  Compte admin mis à jour (mot de passe réinitialisé)");
    console.log("   Email    :", ADMIN.email);
    console.log("   Password :", ADMIN.password);
    await mongoose.disconnect();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(ADMIN.password, salt);

  await User.create({ ...ADMIN, password: hashed });
  console.log("✔  Compte admin créé avec succès !");
  console.log("   Email    :", ADMIN.email);
  console.log("   Password :", ADMIN.password);

  await mongoose.disconnect();
}

createAdmin().catch((err) => {
  console.error("Erreur :", err.message);
  process.exit(1);
});
