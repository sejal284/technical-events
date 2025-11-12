import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String },
  category: { type: String, required: true },
  location: { type: String },
  description: { type: String, required: true },
  maxParticipants: { type: Number },
  createdBy: {
    adminId: { type: String },
    adminEmail: { type: String },
    adminName: { type: String }
  },
  attendees: [{
    userId: { type: String },
    name: { type: String },
    email: { type: String },
    registeredAt: { type: Date, default: Date.now }
  }],
  rsvps: [{
    userId: { type: String },
    name: { type: String },
    email: { type: String },
    status: { type: String, enum: ["yes", "no", "maybe"], default: "yes" },
    respondedAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

const Event = mongoose.model("Event", eventSchema);

export default Event;
