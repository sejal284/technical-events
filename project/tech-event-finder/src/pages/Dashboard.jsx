import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Calendar, Newspaper, User, Settings, LogOut, Plus, TrendingUp, BarChart3 } from "lucide-react";
import bgImage from "../assets/D.avif";

function Dashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]); // Store all events for filtering
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'all-events', 'upcoming', 'completed'
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalRegistered: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    categoryBreakdown: {},
    recentActivity: []
  });
  const [adminAnalytics, setAdminAnalytics] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    popularEvents: [],
    eventPerformance: [],
    events: [] // Add events array for management
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedUserType = localStorage.getItem("userType");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedUserType) {
      setUserType(storedUserType);
    }

    // Listen for storage changes (when profile is updated in another tab)
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("user");
      const updatedUserType = localStorage.getItem("userType");
      if (updatedUser) {
        setUser(JSON.parse(updatedUser));
      }
      if (updatedUserType) {
        setUserType(updatedUserType);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Calculate analytics from events
  const calculateAnalytics = (events) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset time for fair comparison
    
    const upcoming = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now;
    });
    
    const completed = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate < now;
    });
    
    // Category breakdown for pie chart
    const categoryBreakdown = events.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {});

    // Convert to chart data format
    const categoryChartData = Object.entries(categoryBreakdown).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / events.length) * 100).toFixed(1)
    }));

    // Monthly registration trend (last 6 months)
    const monthlyData = {};
    events.forEach(event => {
      const date = new Date(event.registeredAt || event.createdAt || event.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    const monthlyTrend = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        registrations: count
      }));

    // Event status distribution
    const statusData = [
      { name: 'Upcoming', value: upcoming.length, color: '#10B981' },
      { name: 'Completed', value: completed.length, color: '#8B5CF6' },
    ];

    // Recent activity (last 5 events by registration date)
    const recentActivity = events
      .sort((a, b) => new Date(b.registeredAt || b.createdAt || 0) - new Date(a.registeredAt || a.createdAt || 0))
      .slice(0, 5);

    setAnalytics({
      totalRegistered: events.length,
      upcomingEvents: upcoming.length,
      completedEvents: completed.length,
      categoryBreakdown,
      categoryChartData,
      monthlyTrend,
      statusData,
      recentActivity
    });
  };

  // Fetch admin analytics
  const fetchAdminAnalytics = async () => {
    try {
  // Try both 'user' and 'me' keys to find the logged-in admin
  const adminRaw = localStorage.getItem("user") || localStorage.getItem("me") || "{}";
  const adminUser = JSON.parse(adminRaw);
      console.log("Admin user from localStorage:", adminUser);
      
      const params = new URLSearchParams();
      
      // Use adminId or adminEmail to fetch admin-specific events
      if (adminUser.id || adminUser._id) {
        const adminId = adminUser.id || adminUser._id;
        params.append("adminId", adminId);
        console.log("Using adminId:", adminId);
      } else if (adminUser.email) {
        params.append("adminEmail", adminUser.email);
        console.log("Using adminEmail:", adminUser.email);
      } else {
        console.error("No admin identifier found in user data:", adminUser);
        return;
      }

      const url = `http://localhost:5000/api/events/by-admin?${params.toString()}`;
      console.log("Fetching admin analytics from:", url);
      
      const res = await fetch(url);
      console.log("Response status:", res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log("Admin analytics data received:", data);
        
        setAdminAnalytics({
          totalEvents: data.analytics.totalEvents,
          totalRegistrations: data.analytics.totalRegistrations,
          popularEvents: data.analytics.popularEvents,
          eventPerformance: data.analytics.popularEvents,
          events: data.events // Store the actual events for management
        });
      } else {
        const errorText = await res.text();
        console.error("Failed to fetch admin analytics:", res.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching admin analytics:', error);
    }
  };

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const me = JSON.parse(localStorage.getItem("me") || "null") || JSON.parse(localStorage.getItem("user") || "null");
        if (!me) return;
        
        if (userType === "admin") {
          await fetchAdminAnalytics();
        }
        
        const params = new URLSearchParams();
        if (me.id) params.append("userId", me.id);
        if (me.email) params.append("email", me.email);
        const res = await fetch(`http://localhost:5000/api/events/by-user?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setMyEvents(data);
          calculateAnalytics(data);
        }
      } catch {}
    };
    fetchMyEvents();
    // listen for cross-page updates when user registers/RSVPs
    const onChanged = () => fetchMyEvents();
    window.addEventListener('registered-events-changed', onChanged);
    return () => window.removeEventListener('registered-events-changed', onChanged);
  }, [user, userType]);

  const getMenuItems = () => {
    const baseItems = [
      { id: "home", label: "Home", icon: <Home size={18} />, path: "/" },
      { id: "events", label: "Events", icon: <Calendar size={18} />, path: "/events" },
      { id: "news", label: "News", icon: <Newspaper size={18} />, path: "/news" },
      { id: "settings", label: "My Account", icon: <User size={18} />, path: "/profile" },
    ];

    // No need to add separate "Add Event" for admin since it's available in Events page

    return baseItems;
  };

  // Handle view changes for interactive dashboard
  const handleViewChange = (view) => {
    setActiveView(view);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
    
    switch (view) {
      case 'all-events':
        setFilteredEvents(myEvents);
        break;
      case 'upcoming':
        const upcomingEvents = myEvents.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= today;
        });
        setFilteredEvents(upcomingEvents);
        break;
      case 'completed':
        const completedEvents = myEvents.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate < today;
        });
        setFilteredEvents(completedEvents);
        break;
      default:
        setActiveView('dashboard');
        break;
    }
  };

  // Format date for display
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  // Handle event deletion
  const handleDeleteEvent = async (eventId, eventName) => {
    if (!window.confirm(`Are you sure you want to delete "${eventName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Get admin information for authorization
      const adminRaw = localStorage.getItem("user") || localStorage.getItem("me") || "{}";
      const adminUser = JSON.parse(adminRaw);
      
      const params = new URLSearchParams();
      if (adminUser.id || adminUser._id) {
        params.append("adminId", adminUser.id || adminUser._id);
      } else if (adminUser.email) {
        params.append("adminEmail", adminUser.email);
      }

      const response = await fetch(`http://localhost:5000/api/events/${eventId}?${params.toString()}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Event deleted successfully!');
        // Refresh admin analytics to update the UI
        await fetchAdminAnalytics();
      } else {
        const errorData = await response.json();
        alert(`Error deleting event: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event. Please try again.');
    }
  };

  return (
    <div
      className="flex min-h-screen text-white relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* optional: overlay for better readability */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Sidebar */}
      <aside className="w-64 bg-white/10 backdrop-blur-lg shadow-lg flex flex-col relative z-10">
        <div className="px-6 py-6 text-2xl font-bold text-indigo-400">TechEvents Hub</div>
        <nav className="flex-1 px-4 space-y-2">
          {getMenuItems().map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActive(item.id);
                navigate(item.path);
              }}
              className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-left transition ${
                active === item.id ? "bg-indigo-500 text-white" : "hover:bg-white/20"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 m-4 rounded-lg bg-red-500 hover:bg-red-600 transition"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto relative z-10">
        {/* Top Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome Back 👋</h1>
            {userType && (
              <p className="text-lg text-gray-300 mt-1">
                {userType === "admin" ? "⚡ Admin Dashboard" : "👤 User Dashboard"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-gray-300 block">{user?.name || "User"}</span>
              {userType && (
                <span className={`text-sm px-2 py-1 rounded-full ${
                  userType === "admin" 
                    ? "bg-purple-600 text-purple-100" 
                    : "bg-blue-600 text-blue-100"
                }`}>
                  {userType.charAt(0).toUpperCase() + userType.slice(1)}
                </span>
              )}
            </div>
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=6366f1&color=fff`}
              alt="avatar"
              className="w-10 h-10 rounded-full border-2 border-indigo-500"
            />
          </div>
        </header>

        {/* Conditional Content Based on Active View */}
        {activeView === 'dashboard' ? (
          <>
            {/* Dashboard Analytics Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Registered Events */}
          <div 
            onClick={() => handleViewChange('all-events')}
            className="p-6 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl shadow-lg hover:scale-105 transition border border-blue-500/30 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/30 rounded-full group-hover:bg-blue-500/50 transition">
                <Calendar className="text-blue-300" size={24} />
              </div>
              <span className="text-3xl font-bold text-blue-300">{analytics.totalRegistered}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Total Events</h3>
            <p className="text-blue-200 text-sm">Click to view all • Registered events</p>
          </div>

          {/* Upcoming Events */}
          <div 
            onClick={() => handleViewChange('upcoming')}
            className="p-6 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-2xl shadow-lg hover:scale-105 transition border border-green-500/30 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/30 rounded-full group-hover:bg-green-500/50 transition">
                <Calendar className="text-green-300" size={24} />
              </div>
              <span className="text-3xl font-bold text-green-300">{analytics.upcomingEvents}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Upcoming</h3>
            <p className="text-green-200 text-sm">Click to view details • Future events</p>
          </div>

          {/* Completed Events */}
          <div 
            onClick={() => handleViewChange('completed')}
            className="p-6 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-2xl shadow-lg hover:scale-105 transition border border-purple-500/30 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/30 rounded-full group-hover:bg-purple-500/50 transition">
                <Calendar className="text-purple-300" size={24} />
              </div>
              <span className="text-3xl font-bold text-purple-300">{analytics.completedEvents}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Completed</h3>
            <p className="text-purple-200 text-sm">Click to view details • Past events</p>
          </div>
        </section>

        {/* Admin Analytics Section */}
        {userType === "admin" && (
          <section className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
              ⚡ Admin Analytics Dashboard
            </h2>
            
            {/* Admin Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-gradient-to-r from-pink-500/20 to-pink-600/20 rounded-2xl shadow-lg hover:scale-105 transition border border-pink-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-pink-500/30 rounded-full">
                    <Calendar className="text-pink-300" size={24} />
                  </div>
                  <span className="text-3xl font-bold text-pink-300">{adminAnalytics.totalEvents}</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Total Events</h3>
                <p className="text-pink-200 text-sm">Events created</p>
              </div>

              <div className="p-6 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 rounded-2xl shadow-lg hover:scale-105 transition border border-cyan-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-cyan-500/30 rounded-full">
                    <User className="text-cyan-300" size={24} />
                  </div>
                  <span className="text-3xl font-bold text-cyan-300">{adminAnalytics.totalRegistrations}</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Total Registrations</h3>
                <p className="text-cyan-200 text-sm">Across all events</p>
              </div>

              <div className="p-6 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-2xl shadow-lg hover:scale-105 transition border border-emerald-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-500/30 rounded-full">
                    <TrendingUp className="text-emerald-300" size={24} />
                  </div>
                  <span className="text-lg font-bold text-emerald-300">
                    {adminAnalytics.totalEvents > 0 ? (adminAnalytics.totalRegistrations / adminAnalytics.totalEvents).toFixed(1) : '0'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white">Avg Registrations</h3>
                <p className="text-emerald-200 text-sm">Per event</p>
              </div>
            </div>

            {/* Event Performance Chart */}
            {adminAnalytics.eventPerformance?.length > 0 && (
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-lg">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  🏆 Top Performing Events
                </h3>
                <div className="space-y-4">
                  {adminAnalytics.eventPerformance.map((event, index) => {
                    const maxRegistrations = Math.max(...adminAnalytics.eventPerformance.map(e => e.registrations));
                    const percentage = (event.registrations / maxRegistrations) * 100;
                    const colors = ['bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-pink-500', 'bg-indigo-500'];
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center text-white">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-yellow-500/30 flex items-center justify-center text-yellow-300 font-bold text-sm">
                              {index + 1}
                            </span>
                            <div>
                              <span className="font-medium">{event.name}</span>
                              <span className="text-gray-300 text-sm ml-2">({event.category})</span>
                            </div>
                          </div>
                          <span className="font-bold">{event.registrations} reg.</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-3">
                          <div 
                            className={`${colors[index % colors.length]} h-3 rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Admin Events Management Section */}
        {userType === "admin" && (
          <section className="mb-8">
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-lg">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                🗂️ My Events
              </h3>
              {adminAnalytics.events?.length > 0 ? (
                <div className="space-y-4">
                  {adminAnalytics.events.map((event, index) => (
                    <div key={event._id || index} className="bg-white/5 rounded-lg p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{event.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-300 mt-1">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                            {event.category}
                          </span>
                          <span>{event.attendees?.length || 0} registrations</span>
                          <span className="text-gray-400">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(event._id, event.name)}
                        className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📝</div>
                  <p className="text-gray-300">No events created yet</p>
                  <p className="text-gray-400 text-sm">Create your first event to see it here</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Advanced Analytics Charts - CSS Based */}
        {Object.keys(analytics.categoryBreakdown).length > 0 && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Category Distribution Chart */}
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-lg">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 size={24} />
                📊 Events by Category
              </h2>
              <div className="space-y-4">
                {Object.entries(analytics.categoryBreakdown).map(([category, count], index) => {
                  const percentage = (count / analytics.totalRegistered) * 100;
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-purple-500'];
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between text-white">
                        <span>{category}</span>
                        <span>{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-3">
                        <div 
                          className={`${colors[index % colors.length]} h-3 rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Event Status Visual */}
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-lg">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={24} />
                📈 Event Status Overview
              </h2>
              <div className="grid grid-cols-2 gap-6 h-48">
                {/* Upcoming Events Visual */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-24 h-24 mb-4">
                    <div className="w-24 h-24 rounded-full bg-green-500/30 flex items-center justify-center border-4 border-green-500">
                      <span className="text-2xl font-bold text-green-300">{analytics.upcomingEvents}</span>
                    </div>
                  </div>
                  <h3 className="text-green-300 font-semibold">Upcoming</h3>
                </div>

                {/* Completed Events Visual */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-24 h-24 mb-4">
                    <div className="w-24 h-24 rounded-full bg-purple-500/30 flex items-center justify-center border-4 border-purple-500">
                      <span className="text-2xl font-bold text-purple-300">{analytics.completedEvents}</span>
                    </div>
                  </div>
                  <h3 className="text-purple-300 font-semibold">Completed</h3>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Recent Activity */}
        {analytics.recentActivity.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">🕒 Recent Activity</h2>
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-lg">
              <div className="space-y-4">
                {analytics.recentActivity.map((event, index) => (
                  <div key={event._id} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-500/30 rounded-full flex items-center justify-center">
                      <span className="text-indigo-300 font-semibold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{event.name}</h4>
                      <p className="text-gray-300 text-sm">{event.category} • {event.date}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-green-400 text-sm">Registered</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

            {/* My Registered Events */}
            <section className="mt-10">
              <h2 className="text-2xl font-bold text-white mb-4">✅ My Registered Events</h2>
              {myEvents.length === 0 ? (
                <p className="text-gray-300">You haven't registered for any events yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myEvents.map(ev => (
                    <div key={ev._id} className="bg-white/10 rounded-2xl p-5 text-white shadow">
                      <h3 className="text-lg font-semibold mb-1">{ev.name}</h3>
                      <p className="text-gray-300 text-sm">{ev.category}</p>
                      <div className="mt-2 text-sm text-gray-200">📅 {ev.date}{ev.time ? ` • ${ev.time}` : ''}</div>
                      {ev.location && <div className="text-sm text-gray-200">📍 {ev.location}</div>}
                      <p className="mt-2 text-gray-300 text-sm">{ev.description?.length > 90 ? ev.description.slice(0,90)+"..." : ev.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          /* Detailed Event Views */
          <div className="space-y-6">
            {/* Back Button */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => handleViewChange('dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600/50 hover:bg-gray-600/70 rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {activeView === 'all-events' && '📅 All My Events'}
                  {activeView === 'upcoming' && '⏰ Upcoming Events'}
                  {activeView === 'completed' && '✅ Completed Events'}
                </h1>
                <p className="text-gray-300 mt-1">
                  {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
                </p>
              </div>
            </div>

            {/* Event List */}
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white/10 rounded-2xl p-8 max-w-md mx-auto">
                  <div className="text-6xl mb-4">
                    {activeView === 'upcoming' && '⏳'}
                    {activeView === 'completed' && '✨'}
                    {activeView === 'all-events' && '📭'}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {activeView === 'upcoming' && 'No Upcoming Events'}
                    {activeView === 'completed' && 'No Completed Events'}
                    {activeView === 'all-events' && 'No Events Found'}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {activeView === 'upcoming' && 'You don\'t have any upcoming events. Register for new events to see them here.'}
                    {activeView === 'completed' && 'You haven\'t completed any events yet. Check back after attending some events.'}
                    {activeView === 'all-events' && 'You haven\'t registered for any events yet. Start exploring events to build your collection.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event, index) => (
                  <div key={event._id || index} className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition-all duration-300 border border-white/20">
                    {/* Event Header */}
                    <div className="p-6 border-b border-white/10">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-white line-clamp-2 pr-2">{event.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (() => {
                            const eventDate = new Date(event.date);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return eventDate >= today 
                              ? 'bg-green-500/30 text-green-300' 
                              : 'bg-gray-500/30 text-gray-300';
                          })()
                        }`}>
                          {(() => {
                            const eventDate = new Date(event.date);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return eventDate >= today ? 'Upcoming' : 'Completed';
                          })()}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="text-blue-300">{event.category}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatEventDate(event.date)}</span>
                          {event.time && <span className="text-gray-400">• {event.time}</span>}
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Event Description */}
                    <div className="p-6">
                      <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                        {event.description || 'No description available for this event.'}
                      </p>
                      
                      {/* Event Actions */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Registered</span>
                        </div>
                        
                        {event.url && (
                          <a
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-blue-500/30 hover:bg-blue-500/50 text-blue-300 text-xs rounded-lg transition-colors duration-200"
                          >
                            View Details
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
