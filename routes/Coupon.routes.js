const express = require("express");
const Coupon = require("../models/Coupon.model");
const router = express.Router();

// Get all coupons
router.get("/", async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Validate coupon for checkout and cart
router.post("/validate", async (req, res) => {
  try {
    const { code, totalAmount = 0 } = req.body;
    if (!code) {
      return res.status(400).json({ valid: false, message: "Coupon code is required" });
    }

    const cleanCode = String(code).toUpperCase().trim();
    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      return res.status(404).json({ valid: false, message: `Coupon code "${cleanCode}" is invalid` });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ valid: false, message: "This coupon is currently inactive" });
    }

    const today = new Date().toISOString().split("T")[0];
    if (coupon.startDate && today < coupon.startDate) {
      return res.status(400).json({ valid: false, message: "This coupon offer has not started yet" });
    }

    if (coupon.endDate && today > coupon.endDate) {
      return res.status(400).json({ valid: false, message: "This coupon has expired" });
    }

    const orderAmount = Number(totalAmount || 0);
    if (coupon.minOrderValue && orderAmount < coupon.minOrderValue) {
      return res.status(400).json({
        valid: false,
        message: `Minimum order value of ₹${coupon.minOrderValue.toLocaleString('en-IN')} required for this coupon`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, orderAmount);

    return res.status(200).json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Math.round(discountAmount),
      finalAmount: Math.max(0, Math.round(orderAmount - discountAmount)),
      message: `Coupon "${coupon.code}" applied successfully!`,
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    res.status(500).json({ valid: false, message: "Server error", error: error.message });
  }
});

// Create coupon
router.post("/", async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      usageLimit,
      startDate,
      endDate,
      isActive,
      description,
    } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const cleanCode = String(code).toUpperCase().trim();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ message: `Coupon with code "${cleanCode}" already exists` });
    }

    const newCoupon = new Coupon({
      code: cleanCode,
      discountType: discountType || "percentage",
      discountValue: Number(discountValue || 10),
      minOrderValue: Number(minOrderValue || 0),
      maxDiscount: Number(maxDiscount || 10000),
      usageLimit: Number(usageLimit || 500),
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate: endDate || "2026-12-31",
      isActive: isActive !== false,
      description: description || "",
    });

    await newCoupon.save();
    res.status(201).json(newCoupon);
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update coupon
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      usageLimit,
      startDate,
      endDate,
      isActive,
      description,
    } = req.body;

    const updated = await Coupon.findByIdAndUpdate(
      id,
      {
        ...(code && { code: String(code).toUpperCase().trim() }),
        ...(discountType && { discountType }),
        ...(discountValue !== undefined && { discountValue: Number(discountValue) }),
        ...(minOrderValue !== undefined && { minOrderValue: Number(minOrderValue) }),
        ...(maxDiscount !== undefined && { maxDiscount: Number(maxDiscount) }),
        ...(usageLimit !== undefined && { usageLimit: Number(usageLimit) }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(description !== undefined && { description }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating coupon:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete coupon
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.status(200).json({ message: "Coupon deleted successfully", id });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
