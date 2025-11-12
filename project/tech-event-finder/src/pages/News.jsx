import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../lib/apiConfig";
import Navbar from "../components/Navbar";
import bgImage from "../assets/D.avif";

function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefreshing, setAutoRefreshing] = useState(false);

  useEffect(() => {
    fetchNews();
    
    // Set up automatic refresh every 5 minutes (300000ms)
    const refreshInterval = setInterval(() => {
      console.log("Auto-refreshing news...");
      setAutoRefreshing(true);
      fetchNews().finally(() => {
        setAutoRefreshing(false);
      });
    }, 5 * 60 * 1000); // 5 minutes
    
    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
  // Update this URL to match your backend server
  const response = await axios.get(`${API_BASE}/news`);
      
      if (response.data.success) {
        setNews(response.data.data);
        setLastUpdated(response.data.lastUpdated || new Date().toISOString());
      } else {
        throw new Error(response.data.error || "Failed to fetch news");
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setError(error.response?.data?.error || error.message || "Unable to load news");
      
      // Set fallback news if available from the error response
      if (error.response?.data?.data) {
        setNews(error.response.data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) !== 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch {
      return 'Unknown date';
    }
  };

  const handleRetry = () => {
    fetchNews();
  };

  return (
    <div
      className="min-h-screen text-white relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/60"></div>
      
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
                {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-6">
            � Latest Tech News
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Stay ahead with real-time updates on AI, Web Development, Blockchain, and emerging technologies
          </p>
          
          {/* Status Indicators */}
          <div className="flex items-center justify-center gap-6 mb-6">
            {lastUpdated && (
              <div className="flex items-center gap-2 text-green-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Updated: {formatDate(lastUpdated)}</span>
              </div>
            )}
            
            {autoRefreshing && (
              <div className="flex items-center gap-2 text-blue-400">
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm">Auto-refreshing...</span>
              </div>
            )}
            
            {news.length > 0 && (
              <div className="flex items-center gap-2 text-cyan-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <span className="text-sm">{news.length} Articles Loaded</span>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
            <span className="ml-4 text-white text-lg">Loading latest news...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && news.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-red-300 mb-4">Unable to Load News</h3>
              <p className="text-red-200 mb-6">{error}</p>
              <button
                onClick={handleRetry}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Error Banner (when we have fallback data) */}
        {error && news.length > 0 && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <p className="text-yellow-200">
                ⚠️ {error}. Showing cached content.
              </p>
              <button
                onClick={handleRetry}
                className="px-4 py-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded text-sm transition-colors duration-200"
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* News Grid */}
        {!loading && news.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((article, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-white/20 group"
              >
                {/* Article Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=200&fit=crop";
                    }}
                  />
                  {/* Source Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      article.source === 'Dev.to' 
                        ? 'bg-purple-500/90 text-white' 
                        : article.source === 'TechCrunch'
                        ? 'bg-green-500/90 text-white'
                        : article.source === 'GitHub'
                        ? 'bg-gray-800/90 text-white'
                        : article.source?.includes('Reddit')
                        ? 'bg-orange-500/90 text-white'
                        : 'bg-blue-500/90 text-white'
                    }`}>
                      {article.source || 'Tech News'}
                    </span>
                  </div>
                  {/* Category Badge */}
                  {article.category && (
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-black/60 text-yellow-300 border border-yellow-300/30">
                        {article.category}
                      </span>
                    </div>
                  )}
                  {/* Live indicator for real-time sources */}
                  {(article.source === 'Dev.to' || article.source === 'TechCrunch' || article.source === 'GitHub') && (
                    <div className="absolute bottom-4 right-4">
                      <div className="flex items-center gap-1 bg-red-500/80 px-2 py-1 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-white text-xs font-medium">LIVE</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Article Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-blue-300 transition-colors duration-300">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {article.description}
                  </p>

                  {/* Article Meta */}
                  <div className="flex items-center justify-between mb-4 text-xs">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-400">
                        {formatDate(article.publishedAt)}
                      </span>
                    </div>
                    {article.author && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-gray-400 truncate">
                          {article.author}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Read More Button */}
                  <div className="flex items-center justify-between">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 text-sm group/button"
                    >
                      Read More
                      <svg
                        className="ml-2 w-4 h-4 group-hover/button:translate-x-1 transition-transform duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    {/* Trending/Hot indicator */}
                    {(index < 3) && (
                      <div className="flex items-center gap-1 text-orange-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-medium">HOT</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && news.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white/10 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-white mb-4">No News Available</h3>
              <p className="text-gray-300 mb-6">
                We couldn't find any news articles at the moment. Please check back later.
              </p>
              <button
                onClick={handleRetry}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Back to Home Link */}
        <div className="text-center mt-12">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg font-medium transition-all duration-200"
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

export default News;
