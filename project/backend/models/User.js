import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['user', 'admin'], default: 'user' },
  isApproved: { type: Boolean, default: true }, // Users are auto-approved, admins need approval
}, {
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

export default mongoose.model("User", userSchema);
