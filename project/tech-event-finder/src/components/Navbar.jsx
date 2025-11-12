// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setIsLoggedIn(true);
  }, []);

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-black/40 backdrop-blur-md shadow-md relative">
      <h2 className="text-2xl font-bold text-white">TechEvents Hub</h2>
      <div className="flex gap-6 text-white font-medium items-center">
        <Link to="/" className="hover:text-indigo-400 transition">Home</Link>
        <Link to="/events" className="hover:text-indigo-400 transition">Events</Link>
        <Link to="/news" className="hover:text-indigo-400 transition">News</Link>
        <Link to="/about" className="hover:text-indigo-400 transition">About</Link>

        {!isLoggedIn ? (
          <>
            <Link
              to="/login"
              className="px-3 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-3 py-1 rounded-lg bg-green-500 hover:bg-green-600 transition"
            >
              Register
            </Link>
          </>
        ) : (
          <Link
            to="/dashboard"
            className="hover:text-indigo-400 transition"
          >
            Profile
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
