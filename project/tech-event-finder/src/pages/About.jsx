import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe, 
  Heart,
  Award,
  Target,
  Lightbulb,
  Code,
  Rocket,
  Star,
  Github,
  Linkedin,
  Twitter,
  Mail
} from "lucide-react";
import bgImage from "../assets/bg-tech.jpg";

function About() {
  const [stats, setStats] = useState({
    totalUsers: 5420,
    totalEvents: 1280,
    citiesCovered: 45,
    successRate: 98
  });

  // Animated counter effect
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        totalUsers: Math.min(prev.totalUsers + Math.floor(Math.random() * 10), 5500),
        totalEvents: Math.min(prev.totalEvents + Math.floor(Math.random() * 3), 1300),
        citiesCovered: Math.min(prev.citiesCovered + (Math.random() > 0.8 ? 1 : 0), 50),
        successRate: prev.successRate
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Smart Event Discovery",
      description: "AI-powered recommendations to find events perfectly matched to your interests and skill level"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Building",
      description: "Connect with like-minded tech professionals and build lasting professional relationships"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Verified Events",
      description: "All events are verified for quality and authenticity to ensure valuable experiences"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Career Growth",
      description: "Track your learning journey and showcase your participation to potential employers"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-time Updates",
      description: "Get instant notifications about new events, changes, and networking opportunities"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Reach",
      description: "Access tech events from around the world, including virtual and hybrid options"
    }
  ];

  const achievements = [
    {
      icon: <Award className="w-6 h-6" />,
      title: "Best Tech Platform 2024",
      organization: "TechCrunch Awards"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "4.8/5 User Rating",
      organization: "Based on 10,000+ reviews"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "98% Event Success Rate",
      organization: "Industry Leading Performance"
    }
  ];

  return (
    <div 
      className="min-h-screen text-white relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/70"></div>
      
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <section className="text-center mb-16 pt-8">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            About TechEvents Hub
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Empowering the global tech community through meaningful connections, cutting-edge events, 
            and opportunities that shape the future of technology.
          </p>
          
          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
              <div className="text-3xl font-bold text-blue-400">{stats.totalUsers.toLocaleString()}+</div>
              <div className="text-gray-300 text-sm">Active Users</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
              <div className="text-3xl font-bold text-green-400">{stats.totalEvents.toLocaleString()}+</div>
              <div className="text-gray-300 text-sm">Events Hosted</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
              <div className="text-3xl font-bold text-purple-400">{stats.citiesCovered}+</div>
              <div className="text-gray-300 text-sm">Cities Covered</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
              <div className="text-3xl font-bold text-yellow-400">{stats.successRate}%</div>
              <div className="text-gray-300 text-sm">Success Rate</div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 flex items-center justify-center gap-3">
              <Lightbulb className="text-yellow-400" />
              Our Mission
            </h2>
            <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-lg border border-white/20">
              <p className="text-xl text-gray-300 text-center leading-relaxed mb-6">
                We believe that technology thrives when brilliant minds come together. Our platform bridges the gap 
                between tech enthusiasts, professionals, and innovators by creating seamless experiences for discovering, 
                attending, and organizing world-class technology events.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <div className="text-center">
                  <Code className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Innovation First</h3>
                  <p className="text-gray-400 text-sm">Fostering cutting-edge technology discussions and breakthroughs</p>
                </div>
                <div className="text-center">
                  <Heart className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Community Driven</h3>
                  <p className="text-gray-400 text-sm">Building meaningful connections that last beyond events</p>
                </div>
                <div className="text-center">
                  <Rocket className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Future Ready</h3>
                  <p className="text-gray-400 text-sm">Preparing professionals for the technology landscape of tomorrow</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose TechEvents Hub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white/10 rounded-2xl p-6 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements Section */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">Recognition & Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {achievements.map((achievement, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30 text-center"
              >
                <div className="text-yellow-400 mb-3 flex justify-center">
                  {achievement.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{achievement.title}</h3>
                <p className="text-gray-300 text-sm">{achievement.organization}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact & CTA Section */}
        <section className="text-center mb-16">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl p-12 border border-blue-500/30">
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Tech Journey?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Join thousands of tech professionals who are already advancing their careers through our platform
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Get Started Today
              </Link>
              <Link
                to="/events"
                className="px-8 py-4 bg-transparent border-2 border-white/30 hover:border-white/60 text-white rounded-xl font-semibold transition-all duration-300"
              >
                Explore Events
              </Link>
              <a
                href="mailto:hello@techevents.com"
                className="flex items-center gap-2 px-6 py-3 text-gray-300 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
                Contact Us
              </a>
            </div>
          </div>
        </section>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg font-medium transition-all duration-200"
          >
            <svg
              className="mr-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default About;