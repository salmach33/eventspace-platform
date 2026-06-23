const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation", required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ["cash", "virement", "carte"],
      default: "virement",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "refunded"],
      default: "pending",
    },
    cancellationReason: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
