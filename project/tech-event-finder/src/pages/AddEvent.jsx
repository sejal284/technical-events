import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock } from "lucide-react";
import bgImage from "../assets/D.avif";
import { API_BASE } from "../lib/apiConfig";

const categoryColors = {
  Workshop: "bg-indigo-500",
  Seminar: "bg-green-500",
  Hackathon: "bg-red-500",
  Webinar: "bg-yellow-500",
  Techfest: "bg-purple-500",
};

const AddEvent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
    category: "",
    location: "",
    description: "",
    maxParticipants: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Event Name is required";
    if (!formData.date) newErrors.date = "Event Date is required";
    if (!formData.category) newErrors.category = "Select a category";
    if (!formData.description) newErrors.description = "Description is required";
    return newErrors;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  try {
    // Get admin information from localStorage (try both 'user' and 'me')
    const rawUser = localStorage.getItem("user") || localStorage.getItem("me") || "{}";
    const user = JSON.parse(rawUser);
    console.log("AddEvent: User from localStorage:", user);
    
    // Prepare event data with admin information
    const eventData = {
      ...formData,
      adminId: user.id || user._id,
      adminEmail: user.email,
      adminName: user.name || user.username
    };
    console.log("AddEvent: Event data being sent:", eventData);

    // POST request to backend
  const response = await fetch(`${API_BASE}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });
    console.log("AddEvent: Response status:", response.status);    const data = await response.json(); // parse backend response

    if (!response.ok) {
      // Show backend error message if any
      alert("Error creating event: " + (data.message || "Unknown error"));
      return;
    }

    alert("Event created successfully!");
    navigate("/explore-events"); // redirect after creation
  } catch (error) {
    console.error("Error creating event:", error);
    alert("Error creating event: " + error.message);
  }
};


  return (
    <div
      className="flex min-h-screen relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <main className="flex-1 p-8 overflow-y-auto relative z-10 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-lg w-full max-w-2xl text-white animate-fadeIn">
          <h1 className="text-3xl font-bold mb-6 text-center">➕ Add New Event</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Event Name */}
            <div className="flex flex-col">
              <label>Event Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="p-3 rounded-md bg-white/20 placeholder-gray-200 focus:bg-white/30 focus:outline-none"
                placeholder="Enter event name"
              />
              {errors.name && <span className="text-red-400 text-sm">{errors.name}</span>}
            </div>

            {/* Date & Time */}
            <div className="flex flex-col md:flex-row md:gap-4">
              <div className="flex flex-col flex-1 relative">
                <label>Date</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="p-3 pl-10 rounded-md bg-white/20 focus:bg-white/30 focus:outline-none w-full"
                  />
                </div>
                {errors.date && <span className="text-red-400 text-sm">{errors.date}</span>}
              </div>

              <div className="flex flex-col flex-1 relative">
                <label>Time</label>
                <div className="relative">
                  <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="p-3 pl-10 rounded-md bg-white/20 focus:bg-white/30 focus:outline-none w-full"
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="flex flex-col">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="p-3 rounded-md bg-white/20 focus:bg-white/30 focus:outline-none text-white"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white'
                }}
              >
                <option value="" className="bg-gray-800 text-white">Select category</option>
                {Object.keys(categoryColors).map((cat) => (
                  <option key={cat} value={cat} className="bg-gray-800 text-white">{cat}</option>
                ))}
              </select>
              {errors.category && <span className="text-red-400 text-sm">{errors.category}</span>}
            </div>

            {/* Location */}
            <div className="flex flex-col">
              <label>Location / Online Link</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="p-3 rounded-md bg-white/20 focus:bg-white/30 focus:outline-none"
                placeholder="Enter location or link"
              />
            </div>

            {/* Max Participants */}
            <div className="flex flex-col">
              <label>Max Participants</label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                className="p-3 rounded-md bg-white/20 focus:bg-white/30 focus:outline-none"
                placeholder="Optional"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="p-3 rounded-md bg-white/20 focus:bg-white/30 focus:outline-none"
                rows="4"
                placeholder="Write a brief description of the event"
              ></textarea>
              {errors.description && <span className="text-red-400 text-sm">{errors.description}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-4 py-3 bg-indigo-500 rounded-xl font-semibold hover:bg-indigo-600 transition transform hover:scale-105"
            >
              Create Event
            </button>
          </form>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn { from {opacity:0; transform: translateY(20px);} to {opacity:1; transform: translateY(0);} }
        .animate-fadeIn { animation: fadeIn 0.8s ease forwards; }
      `}</style>
    </div>
  );
};

export default AddEvent;



