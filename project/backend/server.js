import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import newsRoutes from "./routes/news.js";
import eventRoutes from "./routes/events.js";  // ✅ Event routes
import { authMiddleware } from "./middleware/auth.js";

dotenv.config();

const app = express();

// Middleware
// Allow CORS from the frontend. In production, set FRONTEND_URL to your deployed frontend origin.
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/events", eventRoutes);  // ✅ Events route mounted here

// Health route for platform checks
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Example protected route
app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({ message: "Welcome to your profile!", user: req.user });
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
