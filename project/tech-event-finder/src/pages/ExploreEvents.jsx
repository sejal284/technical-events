import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, MapPin, Users, Search, X } from "lucide-react";
import Navbar from "../components/Navbar";
import bgImage from "../assets/D.avif";

const categoryColors = {
  Workshop: "bg-indigo-500",
  Seminar: "bg-green-500",
  Hackathon: "bg-red-500",
  Webinar: "bg-yellow-500",
  Techfest: "bg-purple-500",
};

const ExploreEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrationForm, setRegistrationForm] = useState({
    name: "",
    email: "",
    phone: "",
    collegeName: "",
    year: "",
    branch: "",
    experience: "",
    expectations: ""
  });

  // Helper function to check if event date has passed
  const isEventPast = (eventDate) => {
    const event = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for fair comparison
    return event < today;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const params = new URLSearchParams();
        if (query) params.append("q", query);
        if (category) params.append("category", category);
        const response = await fetch(`http://localhost:5000/api/events?${params.toString()}`);
        const data = await response.json();
        setEvents(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("Unable to load events");
        setLoading(false);
      }
    };

    fetchEvents();
  }, [query, category, refreshKey]);

  const visibleEvents = useMemo(() => events, [events]);

  const openRegistrationModal = (event) => {
    setSelectedEvent(event);
    setShowRegistrationModal(true);
    
    // Pre-fill form with user data if available
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user) {
      setRegistrationForm(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || ""
      }));
    }
  };

  const closeRegistrationModal = () => {
    setShowRegistrationModal(false);
    setSelectedEvent(null);
    setRegistrationForm({
      name: "",
      email: "",
      phone: "",
      collegeName: "",
      year: "",
      branch: "",
      experience: "",
      expectations: ""
    });
  };

  const handleFormChange = (e) => {
    setRegistrationForm({
      ...registrationForm,
      [e.target.name]: e.target.value
    });
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const payload = {
        userId: user?.id,
        ...registrationForm
      };
      
      const res = await fetch(`http://localhost:5000/api/events/${selectedEvent._id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to register");
      
      alert(`Successfully registered for ${selectedEvent.name}!`);
      window.dispatchEvent(new Event('registered-events-changed'));
      setRefreshKey((k) => k + 1);
      closeRegistrationModal();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div>
      
      {/* Navbar */}
      <div className="relative z-20">
        <Navbar />
      </div>

      <main className="flex-1 p-8 overflow-y-auto relative z-10" style={{ minHeight: "calc(100vh - 80px)" }}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-white mb-8">
            🌟 Explore Events
          </h1>

          {/* Search and Filters */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-6 text-white">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, description, location..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/10 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All categories</option>
                {Object.keys(categoryColors).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        
        {error && (
          <div className="text-center text-red-300 mb-4">{error}</div>
        )}

        {loading ? (
          <p className="text-center text-gray-300">Loading events...</p>
        ) : visibleEvents.length === 0 ? (
          <p className="text-center text-gray-400">No events found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleEvents.map((event) => (
              <div
                key={event._id}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg text-white hover:scale-105 transition transform"
              >
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm mb-3 ${
                    categoryColors[event.category] || "bg-gray-500"
                  }`}
                >
                  {event.category}
                </div>
                <h2 className="text-2xl font-semibold mb-2">{event.name}</h2>

                {/* Date & Time */}
                <div className="flex items-center gap-2 text-gray-300 mb-2">
                  <Calendar size={18} />
                  <span>{event.date}</span>
                </div>
                {event.time && (
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <Clock size={18} />
                    <span>{event.time}</span>
                  </div>
                )}

                {/* Location */}
                {event.location && (
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <MapPin size={18} />
                    <span>{event.location}</span>
                  </div>
                )}

                {/* Description */}
                <p className="text-gray-200 text-sm mb-3">
                  {event.description.length > 100
                    ? event.description.substring(0, 100) + "..."
                    : event.description}
                </p>

                {/* Max Participants */}
                {event.maxParticipants && (
                  <p className="text-gray-300 text-sm">
                    🎟 Max Participants: {event.maxParticipants}
                  </p>
                )}

                {/* Attendees */}
                <div className="flex items-center gap-2 text-gray-300 mt-2">
                  <Users size={18} />
                  <span>{(event.attendees?.length || 0)} registered</span>
                </div>

                {/* Actions */}
                <div className="mt-4">
                  {isEventPast(event.date) ? (
                    <button
                      disabled
                      className="px-6 py-2 rounded-lg bg-gray-500 text-gray-300 cursor-not-allowed font-medium"
                    >
                      Event Ended
                    </button>
                  ) : (
                    <button
                      onClick={() => openRegistrationModal(event)}
                      className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition font-medium"
                    >
                      Register Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </main>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Register for {selectedEvent?.name}
                </h2>
                <button
                  onClick={closeRegistrationModal}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={registrationForm.name}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={registrationForm.email}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={registrationForm.phone}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  {/* College Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      College/Organization *
                    </label>
                    <input
                      type="text"
                      name="collegeName"
                      value={registrationForm.collegeName}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., ABC University"
                      required
                    />
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year/Position *
                    </label>
                    <select
                      name="year"
                      value={registrationForm.year}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Professional">Working Professional</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Branch */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Branch/Field *
                    </label>
                    <input
                      type="text"
                      name="branch"
                      value={registrationForm.branch}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Computer Science, Marketing"
                      required
                    />
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relevant Experience (Optional)
                  </label>
                  <textarea
                    name="experience"
                    value={registrationForm.experience}
                    onChange={handleFormChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Tell us about your relevant experience or skills..."
                  />
                </div>

                {/* Expectations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What do you expect from this event? (Optional)
                  </label>
                  <textarea
                    name="expectations"
                    value={registrationForm.expectations}
                    onChange={handleFormChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Share your expectations and what you hope to learn..."
                  />
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeRegistrationModal}
                    className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Complete Registration
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreEvents;

