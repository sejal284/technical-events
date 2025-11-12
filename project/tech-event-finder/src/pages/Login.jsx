import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bgImage from "../assets/bg-tech.jpg";

function Login() {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState(""); // "user" or "admin"
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const loginEndpoint = loginType === "admin" 
        ? "http://localhost:5000/api/auth/admin-login"
        : "http://localhost:5000/api/auth/login";

      const res = await fetch(loginEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userType: loginType }),
      });

      const data = await res.json();
      console.log("Login response from backend:", data);

      if (res.ok) {
        const token = data.token || data.accessToken;

        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("userType", loginType);

          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }

          alert(`${loginType === "admin" ? "Admin" : "User"} login successful!`);
          navigate("/dashboard");
        } else {
          alert("Login successful, but token missing in response!");
        }
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    }
  };

  const handleBackToOptions = () => {
    setLoginType("");
    setFormData({ email: "", password: "" });
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-black/70 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md text-white">
        {/* Website name above */}
        <h1 className="text-4xl font-extrabold text-center mb-2">
          Tech Events Hub
        </h1>

        {!loginType ? (
          // Login Type Selection
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">Choose Login Type</h2>
            <div className="space-y-4">
              <button
                onClick={() => setLoginType("user")}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white transition duration-300 flex items-center justify-center"
              >
                <span className="mr-2">👤</span>
                User Login
              </button>
              <button
                onClick={() => setLoginType("admin")}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-white transition duration-300 flex items-center justify-center"
              >
                <span className="mr-2">⚡</span>
                Admin Login (Event Organizer)
              </button>
            </div>
            <p className="mt-6 text-sm text-center text-gray-300">
              Don't have an account?{" "}
              <Link to="/register" className="text-indigo-400 hover:underline">
                Register here
              </Link>
            </p>
          </>
        ) : (
          // Login Form
          <>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleBackToOptions}
                className="text-gray-300 hover:text-white transition duration-300"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold text-center">
                {loginType === "admin" ? "Admin Login" : "User Login"}
              </h2>
              <div></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
              <button
                type="submit"
                className={`w-full py-3 ${
                  loginType === "admin" 
                    ? "bg-purple-600 hover:bg-purple-700" 
                    : "bg-indigo-600 hover:bg-indigo-700"
                } rounded-lg font-semibold text-white transition duration-300`}
              >
                {loginType === "admin" ? "Login as Admin" : "Login as User"}
              </button>
            </form>

            <p className="mt-6 text-sm text-center text-gray-300">
              Don't have an account?{" "}
              <Link to="/register" className="text-indigo-400 hover:underline">
                Register here
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
