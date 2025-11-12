import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import bgImage from "../assets/bg-tech.jpg";

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check auth on mount (token is the source of truth)
  useEffect(() => {
    const hasToken = !!localStorage.getItem("token");
    setIsLoggedIn(hasToken);

    // Update if localStorage changes in another tab/window
    const onStorage = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/login");
  };

  // Protected navigation: if not logged in → go to /login
  const go = (path) => {
    if (isLoggedIn) navigate(path);
    else navigate("/login");
  };

  return (
    <div
      className="min-h-screen bg-fixed bg-cover bg-center flex flex-col"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="h-full w-full bg-black/70 flex flex-col">

        {/* Navbar */}
        <nav className="flex items-center justify-between px-8 py-4 bg-black/40 backdrop-blur-md shadow-md relative">
          <h2 className="text-2xl font-bold text-white">TechEvents Hub</h2>
          <div className="flex gap-6 text-white font-medium items-center">
            <Link to="/" className="hover:text-indigo-400 transition">Home</Link>

            {/* Protected items: click -> /login if not logged in */}
            <button onClick={() => go("/events")} className="hover:text-indigo-400 transition">Events</button>
            <button onClick={() => go("/news")} className="hover:text-indigo-400 transition">News</button>
            <button onClick={() => go("/about")} className="hover:text-indigo-400 transition">About</button>
           

            {/* Profile Link (direct to dashboard) */}
            <button
              onClick={() => go("/dashboard")}
              className="hover:text-indigo-400 transition"
            >
              Profile
            </button>
          </div>
        </nav>

        {/* Hero Section */}
<section className="flex flex-col items-center justify-center text-center px-6 py-20">
  <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg leading-tight animate-fadeIn">
    Explore Technical Events 🚀
  </h1>
  <p className="mt-6 max-w-3xl text-lg md:text-2xl text-gray-200 leading-relaxed animate-fadeIn delay-200">
    Discover hackathons, workshops, seminars, webinars, and fests happening around you — all in one place!
  </p>

  {/* Show Login/Register buttons only if not logged in */}
{!isLoggedIn && (
  <div className="mt-8 flex gap-6">
    <Link
      to="/login"
      className="px-8 py-3 rounded-xl font-semibold text-white shadow-lg 
                 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
                 hover:scale-105 hover:shadow-pink-500/50 transition-all duration-300"
    >
      Login
    </Link>
    <Link
      to="/register"
      className="px-8 py-3 rounded-xl font-semibold text-white shadow-lg 
                 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600
                 hover:scale-105 hover:shadow-emerald-400/50 transition-all duration-300"
    >
      Register
    </Link>
  </div>
)}

</section>


        {/* Event Highlights */}
        <section className="px-6 md:px-16 mt-16 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Discover Events That Inspire You ✨
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
            <div className="p-6 bg-white/10 rounded-2xl shadow-lg backdrop-blur-md hover:scale-105 transition-transform duration-300">
              <h3 className="text-xl font-bold mb-2">🔥 Hackathons</h3>
              <p className="text-gray-200 text-sm">
                Compete, innovate, and collaborate in top hackathons near you.
              </p>
            </div>
            <div className="p-6 bg-white/10 rounded-2xl shadow-lg backdrop-blur-md hover:scale-105 transition-transform duration-300">
              <h3 className="text-xl font-bold mb-2">📚 Workshops</h3>
              <p className="text-gray-200 text-sm">
                Learn cutting-edge skills from experts in interactive sessions.
              </p>
            </div>
            <div className="p-6 bg-white/10 rounded-2xl shadow-lg backdrop-blur-md hover:scale-105 transition-transform duration-300">
              <h3 className="text-xl font-bold mb-2">🎤 Webinars & Seminars</h3>
              <p className="text-gray-200 text-sm">
                Stay updated with the latest trends and knowledge sharing.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Fests */}
        <section className="px-6 md:px-16 mt-16 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Featured Tech Fests 🎪
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "InnovateX 2025",
                location: "📍 Bengaluru",
                date: "📅 Sep 12–14",
                description: "A 3-day celebration of innovation, AI, and robotics with global speakers.",
                image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df"
              },
              {
                title: "Code Carnival",
                location: "📍 Mumbai",
                date: "📅 Oct 5–6",
                description: "Dive into coding challenges, tech talks, and startup showcases.",
                image: "https://images.unsplash.com/photo-1522199710521-72d69614c702"
              },
              {
                title: "FutureTech Summit",
                location: "📍 Delhi",
                date: "📅 Nov 18–19",
                description: "Explore the future of tech with panels on quantum computing and space tech.",
                image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d"
              }
            ].map((fest, index) => (
              <div key={index} className="bg-white/10 rounded-2xl shadow-lg backdrop-blur-md overflow-hidden hover:scale-105 transition-transform duration-300">
                <img src={fest.image} alt={fest.title} className="w-full h-48 object-cover" />
                <div className="p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">{fest.title}</h3>
                  <p className="text-sm text-gray-200 mb-2">{fest.location} | {fest.date}</p>
                  <p className="text-sm text-gray-300">{fest.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* News Section */}
        <section className="px-6 md:px-16 mt-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">📰 Latest Tech News</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
            <a
              href="https://www.livemint.com/focus/indias-largest-tech-and-business-event-odoo-community-days-2025-draws-25-000-participants-11755856355937.html"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white/10 rounded-xl shadow-md backdrop-blur-md hover:scale-105 transition-transform duration-300"
            >
              <h3 className="text-lg font-semibold mb-2">Odoo Community Days 2025</h3>
              <p className="text-sm text-gray-200">
                India’s largest tech and business event drew 25,000+ participants, showcasing enterprise software innovation.
              </p>
            </a>
            <a
              href="https://telanganatoday.com/hyderabad-aurora-university-partners-with-quality-thought-to-host-b-tech-career-event"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white/10 rounded-xl shadow-md backdrop-blur-md hover:scale-105 transition-transform duration-300"
            >
              <h3 className="text-lg font-semibold mb-2">Aurora University Career Event</h3>
              <p className="text-sm text-gray-200">
                Hyderabad hosts AI-focused B Tech career event for 2025 pass-outs with expert-led sessions and scholarships.
              </p>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
