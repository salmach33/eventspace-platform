const Space = require("../models/Space");
const User = require("../models/User");
const path = require("path");

// GET /api/spaces - search & filter
const getSpaces = async (req, res) => {
  try {
    const { type, city, minPrice, maxPrice, capacity, search } = req.query;
    const filter = { isActive: true, isValidated: true };

    if (type) filter.type = type;
    if (city) filter["location.city"] = { $regex: city, $options: "i" };
    if (capacity) filter.capacity = { $gte: Number(capacity) };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const spaces = await Space.find(filter)
      .populate("owner", "name email phone avatar")
      .sort({ createdAt: -1 });

    res.json(spaces);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/spaces/:id
const getSpaceById = async (req, res) => {
  try {
    const space = await Space.findById(req.params.id)
      .populate("owner", "name email phone avatar")
      .populate("reviews.client", "name avatar");

    if (!space) return res.status(404).json({ message: "Espace introuvable" });
    res.json(space);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/spaces/owner/my-spaces
const getMySpaces = async (req, res) => {
  try {
    const spaces = await Space.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(spaces);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/spaces
const createSpace = async (req, res) => {
  try {
    const { title, type, description, price, capacity, address, city, country, equipements } = req.body;

    const images = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];

    const space = await Space.create({
      owner: req.user._id,
      title,
      type,
      description,
      price: Number(price),
      capacity: Number(capacity),
      location: { address, city, country: country || "Maroc" },
      equipements: equipements ? JSON.parse(equipements) : [],
      images,
    });

    res.status(201).json(space);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/spaces/:id
const updateSpace = async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);
    if (!space) return res.status(404).json({ message: "Espace introuvable" });
    if (space.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const { title, type, description, price, capacity, address, city, country, equipements, availability } = req.body;

    if (title) space.title = title;
    if (type) space.type = type;
    if (description) space.description = description;
    if (price) space.price = Number(price);
    if (capacity) space.capacity = Number(capacity);
    if (address || city || country) {
      space.location = {
        address: address || space.location.address,
        city: city || space.location.city,
        country: country || space.location.country,
      };
    }
    if (equipements) space.equipements = JSON.parse(equipements);
    if (availability) space.availability = JSON.parse(availability);

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => `/uploads/${f.filename}`);
      space.images = [...space.images, ...newImages];
    }

    const updated = await space.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/spaces/:id
const deleteSpace = async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);
    if (!space) return res.status(404).json({ message: "Espace introuvable" });
    if (space.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Non autorisé" });
    }
    await space.deleteOne();
    res.json({ message: "Espace supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/spaces/:id/reviews
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const space = await Space.findById(req.params.id);
    if (!space) return res.status(404).json({ message: "Espace introuvable" });

    const alreadyReviewed = space.reviews.find(
      (r) => r.client.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) return res.status(400).json({ message: "Vous avez déjà noté cet espace" });

    space.reviews.push({ client: req.user._id, rating: Number(rating), comment });
    space.updateAverageRating();
    await space.save();

    const updated = await Space.findById(space._id).populate("reviews.client", "name avatar");
    res.status(201).json(updated.reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/spaces/:id/reviews/:reviewId
const deleteReview = async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);
    if (!space) return res.status(404).json({ message: "Espace introuvable" });

    const review = space.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Avis introuvable" });

    if (review.client.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Non autorisé" });
    }

    review.deleteOne();
    space.updateAverageRating();
    await space.save();
    res.json({ message: "Avis supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSpaces, getSpaceById, getMySpaces, createSpace, updateSpace, deleteSpace, addReview, deleteReview };
