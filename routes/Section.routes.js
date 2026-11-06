const express = require("express");
const Section = require("../models/Section.model");
const router = express.Router();

// Get all sections
router.get("/", async (req, res) => {
  try {
    const sections = await Section.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json(sections);
  } catch (error) {
    console.error("Error fetching sections:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create section
router.post("/", async (req, res) => {
  try {
    const { title, subtitle, sectionType, categoryKey, order, isActive, bannerImage, buttonText, linkUrl } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Section title is required" });
    }

    const newSection = new Section({
      title,
      subtitle: subtitle || "",
      sectionType: sectionType || "product_grid",
      categoryKey: categoryKey || "All",
      order: Number(order || 0),
      isActive: isActive !== false,
      bannerImage: bannerImage || "",
      buttonText: buttonText || "Shop Collection",
      linkUrl: linkUrl || "/shop",
    });

    await newSection.save();
    res.status(201).json(newSection);
  } catch (error) {
    console.error("Error creating section:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update section
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, sectionType, categoryKey, order, isActive, bannerImage, buttonText, linkUrl } = req.body;

    const updated = await Section.findByIdAndUpdate(
      id,
      {
        ...(title && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(sectionType && { sectionType }),
        ...(categoryKey !== undefined && { categoryKey }),
        ...(order !== undefined && { order: Number(order) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(bannerImage !== undefined && { bannerImage }),
        ...(buttonText !== undefined && { buttonText }),
        ...(linkUrl !== undefined && { linkUrl }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Section not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating section:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete section
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Section.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Section not found" });
    }
    res.status(200).json({ message: "Section deleted successfully", id });
  } catch (error) {
    console.error("Error deleting section:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
