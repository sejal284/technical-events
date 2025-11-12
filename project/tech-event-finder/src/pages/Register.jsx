import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bgImage from "../assets/reg.avif";
import { API_BASE } from "../lib/apiConfig";

function Register() {
  const navigate = useNavigate();
  const [registrationType, setRegistrationType] = useState(""); // "user" or "admin"
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    adminCode: "", // for admin registration
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for username - convert to lowercase and remove spaces
    if (name === 'username') {
      const cleanUsername = value.toLowerCase().replace(/\s+/g, '');
      setFormData({ ...formData, [name]: cleanUsername });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleBackToOptions = () => {
    setRegistrationType("");
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      adminCode: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!formData.name || !formData.username || !formData.email || !formData.password) {
      alert("All fields are required");
      return;
    }

    if (formData.username.length < 3) {
      alert("Username must be at least 3 characters long");
      return;
    }

    // Admin code validation
    if (registrationType === "admin" && !formData.adminCode) {
      alert("Admin authentication code is required for admin registration");
      return;
    }

    try {
      const registerEndpoint = registrationType === "admin" 
        ? `${API_BASE}/auth/admin-register`
        : `${API_BASE}/auth/register`;

      const res = await fetch(registerEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userType: registrationType }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`${registrationType === "admin" ? "Admin" : "User"} registration successful!`);
        navigate("/login");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-black/70 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md text-white">
        <h1 className="text-4xl font-extrabold text-center mb-2">
          Tech Events Hub
        </h1>

        {!registrationType ? (
          // Registration Type Selection
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">Choose Registration Type</h2>
            <div className="space-y-4">
              <button
                onClick={() => setRegistrationType("user")}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white transition duration-300 flex items-center justify-center"
              >
                <span className="mr-2">👤</span>
                <div className="text-left">
                  <div>User Registration</div>
                  <div className="text-xs text-blue-200">Join to discover events</div>
                </div>
              </button>
              <button
                onClick={() => setRegistrationType("admin")}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-white transition duration-300 flex items-center justify-center"
              >
                <span className="mr-2">⚡</span>
                <div className="text-left">
                  <div>Admin Registration</div>
                  <div className="text-xs text-purple-200">Become an event organizer</div>
                </div>
              </button>
            </div>
            <p className="mt-6 text-sm text-center text-gray-300">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-400 hover:underline">
                Login here
              </Link>
            </p>
          </>
        ) : (
          // Registration Form
          <>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleBackToOptions}
                className="text-gray-300 hover:text-white transition duration-300"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold text-center">
                {registrationType === "admin" ? "Admin Registration" : "User Registration"}
              </h2>
              <div></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-1 text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Choose a unique username"
                  minLength="3"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Username will be converted to lowercase and spaces will be removed
                </p>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                  required
                />
              </div>

              {registrationType === "admin" && (
                <div>
                  <label className="block mb-1 text-sm font-medium">Admin Authentication Code</label>
                  <input
                    type="password"
                    name="adminCode"
                    value={formData.adminCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter admin code"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Contact system administrator for the admin authentication code
                  </p>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-3 ${
                  registrationType === "admin" 
                    ? "bg-purple-600 hover:bg-purple-700" 
                    : "bg-indigo-600 hover:bg-indigo-700"
                } rounded-lg font-semibold text-white transition duration-300`}
              >
                {registrationType === "admin" ? "Register as Admin" : "Register as User"}
              </button>
            </form>

            <p className="mt-6 text-sm text-center text-gray-300">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-400 hover:underline">
                Login here
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Register;
