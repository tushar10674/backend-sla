const express = require("express");
const {
  getWishlist,
  addToWishList,
  removeFromWishList,
} = require("../controller/Wishlist.Controller");

const router = express.Router();

// Get wishlist (supports both /wishlist/:userId and /wishlist/wishlist/:userId)
router.get("/:userId", getWishlist);
router.get("/wishlist/:userId", getWishlist);

// Add to wishlist
router.post("/", addToWishList);
router.post("/wishlist", addToWishList);

// Remove from wishlist
router.delete("/remove", removeFromWishList);
router.delete("/:userId/:productId", removeFromWishList);

module.exports = router;
