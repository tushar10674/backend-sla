const Pricing = require('../models/Price.model');
const updateProductPrices = require('../services/priceUpdater');

// Add Today's Gold Price (checks for existence or adds)
const addTodayPrice = async (req, res) => {
    try {
        const { Carat, TodayPricePerGram } = req.body;
        const TodayPricePer = Number(TodayPricePerGram);

        if (!Carat || isNaN(TodayPricePer)) {
            return res.status(400).json({ message: "Valid Carat and TodayPricePerGram are required" });
        }

        const normalizedCarat = Carat.trim();
        const existing = await Pricing.findOne({ Carat: normalizedCarat });
        if (existing) {
            existing.TodayPricePerGram = TodayPricePer;
            existing.createdAt = new Date();
            await existing.save();
            await updateProductPrices();
            return res.status(200).json({ message: `Price for ${normalizedCarat} updated to ₹${TodayPricePer}/g`, Price: existing });
        }

        const newPrice = new Pricing({
            Carat: normalizedCarat,
            TodayPricePerGram: TodayPricePer,
        });

        await newPrice.save();
        await updateProductPrices();

        return res.status(201).json({ message: "Gold price added successfully", Price: newPrice });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Upsert Price by Carat Name (e.g. "24K", "22K", "18K", "Silver")
const upsertTodayPrice = async (req, res) => {
    try {
        const { Carat, TodayPricePerGram } = req.body;
        const priceNum = Number(TodayPricePerGram);

        if (!Carat || isNaN(priceNum) || priceNum < 0) {
            return res.status(400).json({ message: "Valid Carat and non-negative TodayPricePerGram are required" });
        }

        const normalizedCarat = Carat.trim();

        const updatedPrice = await Pricing.findOneAndUpdate(
            { Carat: normalizedCarat },
            { Carat: normalizedCarat, TodayPricePerGram: priceNum, createdAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Instantly recalculate and sync all product prices in MongoDB
        try {
            await updateProductPrices();
        } catch (syncErr) {
            console.warn("Product price sync warning:", syncErr.message);
        }

        return res.status(200).json({
            success: true,
            message: `Live 1g rate for ${normalizedCarat} set to ₹${priceNum.toLocaleString('en-IN')}`,
            data: updatedPrice
        });
    } catch (error) {
        console.error("Error setting metal rate:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Bulk update all metal rates in one transaction
const bulkUpdatePrices = async (req, res) => {
    try {
        const { rates } = req.body; // e.g. { "24K": 7850, "22K": 7200, "18K": 5900, "Silver": 95 }

        if (!rates || typeof rates !== 'object') {
            return res.status(400).json({ message: "Rates object is required" });
        }

        const updatedDocs = [];
        for (const [caratKey, priceVal] of Object.entries(rates)) {
            const priceNum = Number(priceVal);
            if (!isNaN(priceNum) && priceNum >= 0) {
                const normalized = caratKey.trim();
                const doc = await Pricing.findOneAndUpdate(
                    { Carat: normalized },
                    { Carat: normalized, TodayPricePerGram: priceNum, createdAt: new Date() },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                updatedDocs.push(doc);
            }
        }

        // Trigger immediate sync
        try {
            await updateProductPrices();
        } catch (syncErr) {
            console.warn("Bulk product price sync warning:", syncErr.message);
        }

        return res.status(200).json({
            success: true,
            message: `Updated ${updatedDocs.length} metal rates successfully`,
            rates: updatedDocs
        });
    } catch (error) {
        console.error("Error in bulk price update:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update Today's Gold Price by Document ID
const updateTodayPrice = async (req, res) => {
    try {
        const { id } = req.params;
        const { Carat, TodayPricePerGram } = req.body;

        const TodayPricePer = Number(TodayPricePerGram);
        const updateData = { TodayPricePerGram: TodayPricePer };
        if (Carat) updateData.Carat = Carat.trim();

        const updatedPrice = await Pricing.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedPrice) {
            return res.status(404).json({ message: 'Gold price not found' });
        }

        // Trigger sync
        try {
            await updateProductPrices();
        } catch (syncErr) {
            console.warn("Product price sync warning:", syncErr.message);
        }

        return res.status(200).json({
            success: true,
            message: 'Gold price updated successfully',
            data: updatedPrice
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all metal rates
const getAllPrice = async (req, res) => {
  try {
    const prices = await Pricing.find().sort({ createdAt: -1 });

    if (!prices || !prices.length) {
      // If empty, return standard default seed rates so storefront never crashes
      return res.status(200).json([
        { Carat: "24K", TodayPricePerGram: 7850, createdAt: new Date() },
        { Carat: "22K", TodayPricePerGram: 7200, createdAt: new Date() },
        { Carat: "18K", TodayPricePerGram: 5900, createdAt: new Date() },
        { Carat: "Silver", TodayPricePerGram: 95, createdAt: new Date() },
      ]);
    }

    res.status(200).json(prices);
  } catch (error) {
    console.error("Error fetching prices:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  addTodayPrice,
  updateTodayPrice,
  getAllPrice,
  upsertTodayPrice,
  bulkUpdatePrices
};