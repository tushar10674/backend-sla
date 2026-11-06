// routes/Order.routes.js
const express = require("express");

const { verifyToken, optionalVerifyToken, isAdmin } = require("../middleware/authmiddleware");
const {
  createOrder,
  verifyOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
} = require("../controller/Order.Controlller");

const router = express.Router();

// 🔹 Create a new order (Supports both authenticated users and guest checkout)
router.post("/create", optionalVerifyToken, createOrder);
router.post("/verify", optionalVerifyToken, verifyOrder);

// Get user's orders
router.get("/user", verifyToken, getUserOrders);

// Get specific order by ID
router.get("/user/:orderId", verifyToken, getOrderById);

// 🔹 Admin: Get all orders
router.get("/", getAllOrders);

// 🔹 Admin: Update order status
router.patch("/:id/status", async (req, res) => {
  try {
    const Order = require("../models/Order.model");
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order status updated successfully", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
