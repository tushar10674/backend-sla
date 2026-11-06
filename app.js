const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const createError = require("http-errors");
const morgan = require("morgan");
const cors = require("cors");
const listEndpoints = require("express-list-endpoints");
const connectDB = require("./config/db");
const UserRoutes = require("./routes/user.routes");
const GoldRoutes = require("./routes/product.routes");
const ShopRoutes = require("./routes/Shop3.route");
const OrderRoutes = require("./routes/Order.routes");
const AdminRoutes = require("./routes/Admin.Routes");
const GiftingRoutes = require("./routes/Gifting.routes");
const addressRoutes = require("./routes/address.routes");
const CategoryRoutes = require("./routes/Category.routes");
const FeatureRoutes = require("./routes/Feature.routes");
const blogRoutes = require("./routes/blog.routes");
const InstagramRoutes = require("./routes/Instagram.routes");
const EveryRoutes = require("./routes/EveryDay.routes");
const ShopsRoutes = require("./routes/Shop3.route");
const CartRoutes = require("./routes/Cart.routes");
const BestRoutes = require("./routes/Best.route");
const SupportRoutes = require("./routes/Support.routes");
const AboutRoutes = require("./routes/About.routes");
const RelatedRoutes = require("./routes/Related.routes");
const TicketRoutes = require("./routes/Ticket.routes");
const TestimonialRoutes = require("./routes/Testimonial.routes");
const crouselRoutes = require("./routes/Crousel.routes");
const GoldPriceRoutes = require("./routes/Price.routes");
const WishlistRoutes = require("./routes/Wishlist.routes");
const AppBannerRoutes = require("./routes/AppBanner.routes");
const BrandRoutes = require("./routes/Brand.routes");
const CouponRoutes = require("./routes/Coupon.routes");
const SectionRoutes = require("./routes/Section.routes");

const app = express();
app.use(express.json());

// Parse URL-encoded data (for forms)
console.log(listEndpoints(app));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Example route
// app.get("/", async (req, res, next) => {
//   res.send({ message: "Awesome it works 🐻" });
// });

app.options("*", cors());
const allowedOrigins = [
  "https://jewellery-app-dashboard.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:5173",
  "https://srilaalhxmialankar.com",
  "https://dashboard.srilaxmialankar.com",
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      
      // Allow if origin is in whitelist or is any vercel.app preview/production deployment
      const isAllowed = 
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(new URL(origin).hostname) ||
        process.env.NODE_ENV !== "production";

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback: allow all origins with credentials
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Graceful fallback middleware when MongoDB is offline / initializing
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    if (req.method === "GET") {
      if (req.path === "/about") {
        return res.json({ abouts: [{ description: "Sri Laxmi Alankar Jewellery", title: "About Us" }] });
      }
      if (req.path.startsWith("/today-price")) {
        return res.json([
          { Carat: "24K", TodayPricePerGram: 7800 },
          { Carat: "22K", TodayPricePerGram: 7150 },
          { Carat: "18K", TodayPricePerGram: 5850 }
        ]);
      }
      if (req.path.startsWith("/gold")) {
        return res.json({ products: [] });
      }
      if (req.path.startsWith("/shopdetails")) {
        return res.json([{}]);
      }
      return res.json([]);
    }
  }
  next();
});

// API Routes - MUST be registered before static file middleware
app.use("/auth", UserRoutes);
app.use("/gold", GoldRoutes);
app.use("/about", AboutRoutes);
app.use("/order", OrderRoutes);
app.use("/crousel", crouselRoutes);
app.use("/address", addressRoutes);
app.use("/support", SupportRoutes);
app.use("/blog", blogRoutes);
app.use("/category", CategoryRoutes);
app.use("/shop", ShopRoutes);
app.use("/gifting", GiftingRoutes);
app.use("/ticket", TicketRoutes);
app.use("/shopdetails", ShopsRoutes);
app.use("/today-price", GoldPriceRoutes);
app.use("/cart", CartRoutes);
app.use("/related", RelatedRoutes);
app.use("/instagram", InstagramRoutes);
app.use("/admin", AdminRoutes);
app.use("/testimonial", TestimonialRoutes);
app.use("/best", BestRoutes);
app.use("/feature", FeatureRoutes);
app.use("/Everyday", EveryRoutes);
app.use("/appbanner", AppBannerRoutes);
app.use("/wishlist", WishlistRoutes);
app.use("/brand", BrandRoutes);
app.use("/coupon", CouponRoutes);
app.use("/section", SectionRoutes);

// Health check route (must be before catch-all)
app.get("/health", (req, res) => {
  console.log("Health check hit"); // Add this
  res.status(200).send("OK");
});

// Only serve static files if build directory exists (for local development)
// This MUST be after all API routes
if (require('fs').existsSync(path.join(__dirname, "./build/build"))) {
  app.use(express.static(path.join(__dirname, "./build/build")));
}

// Simple API test route
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "API is working!", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test auth endpoint
app.get("/auth/test", (req, res) => {
  res.json({ 
    message: "Auth API is working!", 
    timestamp: new Date().toISOString()
  });
});

// Profile route - serve React app
app.get("/profile", (req, res) => {
  const indexPath = path.join(__dirname, './build/build/index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ message: "API Server is running", status: "OK" });
  }
});

// Catch-all handler: send back React's index.html file for any non-API routes
// Only handle GET requests that don't start with API paths
app.get('*', (req, res, next) => {
  // Skip API routes - let them be handled by their respective middleware
  if (req.path.startsWith('/auth') || 
      req.path.startsWith('/api') || 
      req.path.startsWith('/gold') ||
      req.path.startsWith('/order') ||
      req.path.startsWith('/cart') ||
      req.path.startsWith('/wishlist') ||
      req.path.startsWith('/support') ||
      req.path.startsWith('/admin') ||
      req.path.startsWith('/about') ||
      req.path.startsWith('/crousel') ||
      req.path.startsWith('/address') ||
      req.path.startsWith('/blog') ||
      req.path.startsWith('/category') ||
      req.path.startsWith('/shop') ||
      req.path.startsWith('/gifting') ||
      req.path.startsWith('/ticket') ||
      req.path.startsWith('/shopdetails') ||
      req.path.startsWith('/today-price') ||
      req.path.startsWith('/related') ||
      req.path.startsWith('/instagram') ||
      req.path.startsWith('/testimonial') ||
      req.path.startsWith('/best') ||
      req.path.startsWith('/feature') ||
      req.path.startsWith('/Everyday') ||
      req.path.startsWith('/appbanner')) {
    return next();
  }
  
  const indexPath = path.join(__dirname, './build/build/index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ message: "API Server is running", status: "OK" });
  }
});

// Middleware for handling 404 errors
app.use((req, res, next) => {
  next(createError.NotFound());
});

// app.get("/", (req, res) => {
//   console.log("Root route hit"); // Add this
//   res.send({ message: "Awesome it works 🐻" });
// });
require("./services/priceUpdater");
// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    status: err.status || 500,
    message: err.message,
  });
});

// Connect to the database
connectDB();

// Function to log all routes with full URLs
const listRoutes = (app, baseUrl) => {
  console.log("📂 Available Routes:");
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Regular routes
      const method = Object.keys(middleware.route.methods)
        .join(", ")
        .toUpperCase();
      console.log(`${method} ${baseUrl}${middleware.route.path}`);
    } else if (middleware.name === "router") {
      // Nested router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const method = Object.keys(handler.route.methods)
            .join(", ")
            .toUpperCase();
          console.log(`${method} ${baseUrl}${handler.route.path}`);
        }
      });
    }
  });
};

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("⚡ Socket.io client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Socket client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at ${BASE_URL}`);
  listRoutes(app, BASE_URL); // Log all routes with full URLs
});
