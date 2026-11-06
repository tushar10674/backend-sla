const express = require("express");
const {
  addToCart,
  getCart,
  removeFromCart,
  removeSingleItemFromCart,
} = require("../controller/Cart.controller");

const router = express.Router();

// Add to Cart
router.post("/", addToCart);
router.post("/add-to-cart", addToCart);

// Get Cart Items
router.get("/:userId", getCart);
router.get("/cart/:userId", getCart);

router.patch("/remove-single-item", removeSingleItemFromCart);
router.patch("/cart/remove-single-item", removeSingleItemFromCart);

// Remove from Cart
router.delete("/", removeFromCart);
router.delete("/remove-from-cart", removeFromCart);

module.exports = router;
