const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Section title is required"],
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
    },
    sectionType: {
      type: String,
      enum: ["product_grid", "banner_strip", "curated_lookbook", "category_showcase", "story_block"],
      default: "product_grid",
    },
    categoryKey: {
      type: String,
      default: "All",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    bannerImage: {
      type: String,
      default: "",
    },
    buttonText: {
      type: String,
      default: "Shop Collection",
    },
    linkUrl: {
      type: String,
      default: "/shop",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Section", SectionSchema);
