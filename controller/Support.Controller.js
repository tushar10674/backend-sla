const Support = require("../models/Support.model");

// Create
const createSupport = async (req, res) => {
  try {
    const {
      fullName,
      firstName,
      lastName,
      contactEmail,
      email,
      phoneNumber,
      phone,
      supportQuery,
      message,
      subject
    } = req.body;

    const resolvedFullName = fullName || `${firstName || ""} ${lastName || ""}`.trim() || "Storefront Visitor";
    const resolvedEmail = contactEmail || email || "customer@example.com";
    const resolvedPhone = phoneNumber || phone || "";
    const resolvedQuery = supportQuery || message || (subject ? `Subject: ${subject}` : "General Inquiry");

    const newAbout = new Support({
      fullName: resolvedFullName,
      contactEmail: resolvedEmail,
      phoneNumber: resolvedPhone,
      supportQuery: resolvedQuery,
    });

    await newAbout.save();

    res.status(201).json({
      success: true,
      message: "Contact inquiry submitted successfully",
      support: newAbout,
    });
  } catch (error) {
    console.error("Error in createSupport:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get All
const getAllSupport = async (req, res) => {
  try {
    const abouts = await Support.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Support fetched successfully",
      abouts: abouts || [],
    });
  } catch (error) {
    console.error("Error in getAllSupport:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createSupport,
  getAllSupport,
};
