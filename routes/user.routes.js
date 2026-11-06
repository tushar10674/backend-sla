const {
  userSignup,
  userLogin,
  getAllUsers,
  getUserById,
  sendOTP,
  verifyOTP,
  changePassword,
  adminLogin,
  updateUserProfile,
  getUserProfile,
  googleSignIn,
  resendOTP,
  appleSignIn,
  deleteUserAccount,
} = require("../controller/User.Controller");
const { verifyToken } = require("../middleware/authmiddleware");

const router = require("express").Router();

// Test API Route
router.get("/", (req, res) => {
  res.send({ message: "Ok, API is working 🚀" });
});

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/resend", resendOTP);
// Signup Route
router.post("/signup", userSignup);
router.post("/adminLogin", adminLogin);

router.post("/login", userLogin);
router.post("/google-signin", googleSignIn);
router.post("/apple-signin", appleSignIn); // Assuming Apple Sign-In uses the same login method
// Protected Routes (Require Authentication)

router.get("/users", getAllUsers);
// Get current user profile (must precede /:id)
router.get("/profile", verifyToken, getUserProfile);
router.get("/:id", verifyToken, getUserById);

router.put("/update", verifyToken, (req, res, next) => {
  console.log("=== PROFILE UPDATE ROUTE HIT ===");
  console.log("User from token:", req.user);
  console.log("Request body:", req.body);
  next();
}, updateUserProfile);

// Debug route to test if auth routes are working
router.get("/debug", (req, res) => {
  res.json({ 
    message: "Auth routes are working!", 
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

// Test route to verify JWT token
router.get("/test-token", verifyToken, (req, res) => {
  res.json({ 
    message: "Token is valid!", 
    user: req.user,
    timestamp: new Date().toISOString() 
  });
});

//change password
router.put("/change-password", verifyToken, changePassword);

//delete user account (no authentication required)
router.delete("/delete-account", deleteUserAccount);

module.exports = router;
