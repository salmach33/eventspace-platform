const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    space: { type: mongoose.Schema.Types.ObjectId, ref: "Space", required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    endDate: { type: Date },
    guestCount: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "refused", "cancelled"],
      default: "pending",
    },
    message: { type: String, default: "" },
    cancellationReason: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);
