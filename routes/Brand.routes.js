const express = require("express");
const Brand = require("../models/Brand.model");
const router = express.Router();

// Get all brands
router.get("/", async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 });
    res.status(200).json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create brand
router.post("/", async (req, res) => {
  try {
    const { name, code, origin, activeProducts, status, description } = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: "Name and code are required" });
    }

    const newBrand = new Brand({
      name,
      code: String(code).toUpperCase().trim(),
      origin: origin || "India",
      activeProducts: Number(activeProducts || 0),
      status: status || "Active",
      description: description || "",
    });

    await newBrand.save();
    res.status(201).json(newBrand);
  } catch (error) {
    console.error("Error creating brand:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update brand
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, origin, activeProducts, status, description } = req.body;

    const updated = await Brand.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(code && { code: String(code).toUpperCase().trim() }),
        ...(origin !== undefined && { origin }),
        ...(activeProducts !== undefined && { activeProducts: Number(activeProducts) }),
        ...(status && { status }),
        ...(description !== undefined && { description }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Brand not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating brand:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete brand
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Brand.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.status(200).json({ message: "Brand deleted successfully", id });
  } catch (error) {
    console.error("Error deleting brand:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
