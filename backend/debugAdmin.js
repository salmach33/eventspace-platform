const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

async function debug() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require("./models/User");

  const user = await User.findOne({ email: "admin@eventspace.ma" });
  if (!user) {
    console.log("❌ Aucun utilisateur trouvé avec cet email");
    await mongoose.disconnect();
    return;
  }

  console.log("Utilisateur trouvé :");
  console.log("  name    :", user.name);
  console.log("  email   :", user.email);
  console.log("  role    :", user.role);
  console.log("  blocked :", user.isBlocked);
  console.log("  passHash:", user.password.slice(0, 20), "...");

  const match = await bcrypt.compare("Admin@1234", user.password);
  console.log("  bcrypt compare 'Admin@1234' :", match ? "✔ OK" : "❌ FAIL");
}

debug().catch(console.error).finally(() => mongoose.disconnect());
