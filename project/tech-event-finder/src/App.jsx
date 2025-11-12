import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import News from "./pages/News"; 
import About from "./pages/About";
import ProtectedRoute from "./components/ProtectedRoute";

// new imports
import Eventpage from "./pages/Eventpage"; 
import AddEvent from "./pages/AddEvent";
import ExploreEvents from "./pages/ExploreEvents";

function App() {
  return (
    <Routes>
      {/* Default page is Home */}
      <Route path="/" element={<Home />} />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/news" element={<News />} /> 
      <Route path="/about" element={<About />} />

      {/* Event Routes */}
      <Route path="/events" element={<Eventpage />} />
      <Route
        path="/add-event"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AddEvent />
          </ProtectedRoute>
        }
      />
      <Route path="/explore-events" element={<ExploreEvents />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all: if no route matches, redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;



