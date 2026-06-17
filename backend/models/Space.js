const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const availabilitySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  isAvailable: { type: Boolean, default: true },
});

const spaceSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["mariage", "conference", "evenement"],
      required: true,
    },
    description: { type: String, default: "" },
    images: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, default: "Maroc" },
    },
    equipements: [{ type: String }],
    availability: [availabilitySchema],
    reviews: [reviewSchema],
    averageRating: { type: Number, default: 0 },
    isValidated: { type: Boolean, default: false },
    isRefused: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Recalculate average rating after each review
spaceSchema.methods.updateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
  }
};

module.exports = mongoose.model("Space", spaceSchema);
