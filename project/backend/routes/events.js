import express from "express";
import Event from "../models/Event.js";

const router = express.Router();

// ✅ Create new event
router.post("/", async (req, res) => {
  try {
    const eventData = req.body;
    console.log("Creating event with data:", eventData);
    
    // If admin information is provided, add it to createdBy field
    if (eventData.adminId || eventData.adminEmail) {
      eventData.createdBy = {
        adminId: eventData.adminId,
        adminEmail: eventData.adminEmail,
        adminName: eventData.adminName
      };
      console.log("Added createdBy field:", eventData.createdBy);
      // Remove admin fields from the main event data
      delete eventData.adminId;
      delete eventData.adminEmail; 
      delete eventData.adminName;
    } else {
      console.log("No admin info provided - event will not have createdBy field");
    }
    
    const event = new Event(eventData);
    await event.save();
    console.log("Event saved successfully:", event._id);
    res.status(201).json({ message: "Event created successfully!", event });
  } catch (error) {
    console.error("Error saving event:", error);
    res.status(500).json({ message: "Error creating event", error: error.message });
  }
});

// ✅ Get all events
router.get("/", async (req, res) => {
  try {
    const { q, category } = req.query;
    const filters = {};
    if (q) {
      filters.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
      ];
    }
    if (category) {
      filters.category = category;
    }
    const events = await Event.find(filters).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events" });
  }
});

// ✅ Register for event
router.post("/:id/register", async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      userId, 
      name, 
      email, 
      phone, 
      collegeName, 
      year, 
      branch, 
      experience, 
      expectations 
    } = req.body;

    if (!name || !email || !phone || !collegeName || !year || !branch) {
      return res.status(400).json({ 
        message: "Name, email, phone, college name, year, and branch are required" 
      });
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Check if event date has passed
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison
    
    if (eventDate < today) {
      return res.status(400).json({ 
        message: "Cannot register for past events. This event has already ended." 
      });
    }

    // Capacity check
    if (event.maxParticipants && event.attendees && event.attendees.length >= event.maxParticipants) {
      return res.status(400).json({ message: "Event is full" });
    }

    // Prevent duplicate registration by email or userId
    const already = (event.attendees || []).some(a => (userId && a.userId === userId) || a.email === email);
    if (already) return res.status(400).json({ message: "Already registered for this event" });

    event.attendees = event.attendees || [];
    event.attendees.push({ 
      userId, 
      name, 
      email, 
      phone, 
      collegeName, 
      year, 
      branch, 
      experience: experience || "", 
      expectations: expectations || "",
      registeredAt: new Date()
    });
    await event.save();

    res.json({ message: "Registered successfully", event });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Error registering for event" });
  }
});

// ✅ RSVP to event
router.post("/:id/rsvp", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, name, email, status } = req.body; // yes | no | maybe

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.rsvps = event.rsvps || [];
    const idx = event.rsvps.findIndex(r => (userId && r.userId === userId) || r.email === email);
    if (idx >= 0) {
      event.rsvps[idx] = { ...event.rsvps[idx], name, email, status: status || "yes", respondedAt: new Date() };
    } else {
      event.rsvps.push({ userId, name, email, status: status || "yes" });
    }

    await event.save();
    res.json({ message: "RSVP recorded", event });
  } catch (error) {
    console.error("RSVP error:", error);
    res.status(500).json({ message: "Error recording RSVP" });
  }
});

// ✅ Get events for a specific user (by email or userId)
router.get("/by-user", async (req, res) => {
  try {
    const { userId, email } = req.query;
    if (!userId && !email) return res.status(400).json({ message: "userId or email required" });

    const filter = {};
    if (userId) filter["attendees.userId"] = userId;
    if (email) filter["attendees.email"] = email;

    const events = await Event.find(filter).sort({ date: 1 });
    res.json(events);
  } catch (e) {
    res.status(500).json({ message: "Error fetching user events" });
  }
});

// ✅ Get events created by a specific admin
router.get("/by-admin", async (req, res) => {
  try {
    const { adminId, adminEmail } = req.query;
    console.log("by-admin route called with:", { adminId, adminEmail });
    
    if (!adminId && !adminEmail) {
      console.log("No adminId or adminEmail provided");
      return res.status(400).json({ message: "adminId or adminEmail is required" });
    }

    const filter = {};
    if (adminId) filter["createdBy.adminId"] = adminId;
    if (adminEmail) filter["createdBy.adminEmail"] = adminEmail;
    
    console.log("Filter for events:", filter);

    const events = await Event.find(filter).sort({ createdAt: -1 });
    console.log(`Found ${events.length} events for admin:`, events.map(e => ({ name: e.name, createdBy: e.createdBy })));
    
    // Calculate analytics for this admin
    const totalEvents = events.length;
    const totalRegistrations = events.reduce((sum, event) => sum + (event.attendees?.length || 0), 0);
    
    const responseData = {
      events,
      analytics: {
        totalEvents,
        totalRegistrations,
        popularEvents: events.map(event => ({
          name: event.name,
          registrations: event.attendees?.length || 0,
          category: event.category
        })).sort((a, b) => b.registrations - a.registrations).slice(0, 5)
      }
    };
    
    console.log("Sending response:", responseData.analytics);
    res.json(responseData);
  } catch (error) {
    console.error("Error fetching admin events:", error);
    res.status(500).json({ message: "Error fetching admin events" });
  }
});

// ✅ Delete event (admin can only delete their own events)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, adminEmail } = req.query;
    
    console.log("Delete request for event:", id, "by admin:", { adminId, adminEmail });

    if (!adminId && !adminEmail) {
      return res.status(400).json({ message: "Admin identification required" });
    }

    // Find the event first
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if the admin owns this event
    const isOwner = (adminId && event.createdBy?.adminId === adminId) || 
                   (adminEmail && event.createdBy?.adminEmail === adminEmail);
                   
    if (!isOwner) {
      console.log("Access denied - admin does not own this event");
      return res.status(403).json({ message: "You can only delete events you created" });
    }

    // Delete the event
    await Event.findByIdAndDelete(id);
    console.log("Event deleted successfully:", id);
    
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Error deleting event" });
  }
});

// Debug endpoint to see all events with their createdBy field
router.get("/debug/all", async (req, res) => {
  try {
    const events = await Event.find({}).select('name createdBy attendees').sort({ createdAt: -1 });
    console.log("Debug: All events in database:", events.map(e => ({
      name: e.name,
      createdBy: e.createdBy,
      attendeeCount: e.attendees?.length || 0
    })));
    res.json(events);
  } catch (error) {
    console.error("Error fetching debug events:", error);
    res.status(500).json({ message: "Error fetching debug events" });
  }
});

export default router;
