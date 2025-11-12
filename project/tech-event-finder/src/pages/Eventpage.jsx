import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Search } from "lucide-react";
import Navbar from "../components/Navbar";
import bgImage from "../assets/D.avif";

const Events = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const storedUserType = localStorage.getItem("userType");
    setUserType(storedUserType);
  }, []);

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* overlay for readability */}
      <div className="absolute inset-0 bg-black/60"></div>
      
      {/* Navbar */}
      <div className="relative z-20">
        <Navbar />
      </div>

      <main className="flex-1 p-8 overflow-y-auto relative z-10 flex flex-col items-center justify-center gap-10" style={{ minHeight: "calc(100vh - 80px)" }}>
        <h1 className="text-4xl font-bold text-white mb-10 animate-fadeInDown">Events</h1>
        
        <div className={`grid grid-cols-1 ${userType === "admin" ? "md:grid-cols-2" : ""} gap-10 w-full max-w-4xl`}>
          {/* Add Event Card - Only visible to Admins */}
          {userType === "admin" && (
            <div
              onClick={() => navigate("/add-event")}
              className="p-10 bg-white/10 rounded-2xl shadow-lg hover:scale-105 hover:shadow-indigo-500/50 transition cursor-pointer flex flex-col items-center justify-center animate-fadeInUp"
            >
              <PlusCircle size={48} className="text-indigo-400 mb-4" />
              <h2 className="text-2xl font-semibold mb-2 text-white">Add Event</h2>
              <p className="text-gray-300 text-center">
                Create a new event and share it with your community.
              </p>
            </div>
          )}

          {/* Explore Event Card - Visible to Everyone */}
          <div
            onClick={() => navigate("/explore-events")}
            className={`p-10 bg-white/10 rounded-2xl shadow-lg hover:scale-105 hover:shadow-green-400/50 transition cursor-pointer flex flex-col items-center justify-center animate-fadeInUp ${userType === "admin" ? "delay-150" : ""}`}
          >
            <Search size={48} className="text-green-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-white">Explore Events</h2>
            <p className="text-gray-300 text-center">
              Browse and register for upcoming events.
            </p>
          </div>
        </div>
      </main>

      {/* Animations */}
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeInUp { animation: fadeInUp 0.8s ease forwards; }
          .animate-fadeInDown { animation: fadeInDown 0.8s ease forwards; }
          .delay-150 { animation-delay: 0.15s; }
        `}
      </style>
    </div>
  );
};

export default Events;
