import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// USER REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    
    console.log("User registration request body:", req.body);

    // Validate required fields
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "Name, username, email, and password are required" });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username: username.trim() });
    if (existingUsername) return res.status(400).json({ message: "Username already exists" });

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: "Email already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ 
      name, 
      username, 
      email, 
      password: hashedPassword,
      userType: 'user',
      isApproved: true
    });
    
    console.log("Creating user with data:", { name, username, email, userType: 'user' });
    await newUser.save();
    console.log("User saved successfully:", newUser);

    res.status(201).json({ 
      message: "User registered successfully",
      user: { 
        id: newUser._id, 
        name: newUser.name, 
        username: newUser.username, 
        email: newUser.email,
        userType: newUser.userType
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADMIN REGISTER
router.post("/admin-register", async (req, res) => {
  try {
    const { name, username, email, password, adminCode } = req.body;
    
    console.log("Admin registration request body:", req.body);

    // Validate required fields
    if (!name || !username || !email || !password || !adminCode) {
      return res.status(400).json({ message: "All fields including admin code are required" });
    }

    // Validate admin code (you can change this to your preferred code)
    const ADMIN_CODE = process.env.ADMIN_CODE || "TECH_EVENTS_ADMIN_2024";
    if (adminCode !== ADMIN_CODE) {
      return res.status(400).json({ message: "Invalid admin authentication code" });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username: username.trim() });
    if (existingUsername) return res.status(400).json({ message: "Username already exists" });

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: "Email already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({ 
      name, 
      username, 
      email, 
      password: hashedPassword,
      userType: 'admin',
      isApproved: true
    });
    
    console.log("Creating admin with data:", { name, username, email, userType: 'admin' });
    await newAdmin.save();
    console.log("Admin saved successfully:", newAdmin);

    res.status(201).json({ 
      message: "Admin registered successfully",
      user: { 
        id: newAdmin._id, 
        name: newAdmin.name, 
        username: newAdmin.username, 
        email: newAdmin.email,
        userType: newAdmin.userType
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// USER LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, userType: 'user' });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    if (!user.isApproved) {
      return res.status(400).json({ message: "Account not approved yet" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "User login successful",
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        username: user.username, 
        email: user.email,
        userType: user.userType
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADMIN LOGIN
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email, userType: 'admin' });
    if (!admin) return res.status(400).json({ message: "Invalid admin credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid admin credentials" });

    if (!admin.isApproved) {
      return res.status(400).json({ message: "Admin account not approved yet" });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, userType: admin.userType },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Admin login successful",
      token,
      user: { 
        id: admin._id, 
        name: admin.name, 
        username: admin.username, 
        email: admin.email,
        userType: admin.userType
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE PROFILE
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, username, email } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name || !username || !email) {
      return res.status(400).json({ message: "Name, username, and email are required" });
    }

    // Check if username is taken by another user
    const existingUsername = await User.findOne({ 
      username: username.trim(), 
      _id: { $ne: userId } 
    });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Check if email is taken by another user
    const existingEmail = await User.findOne({ 
      email, 
      _id: { $ne: userId } 
    });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already taken" });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        name: name.trim(),
        username: username.trim(),
        email: email.trim()
      },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CHANGE PASSWORD
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
