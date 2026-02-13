import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Home as HomeIcon, Search } from 'lucide-react';

import Home from './components/Home';
import BrowseArticles from './components/BrowseArticles';
import AdminPortal from './components/AdminPortal';

import logo from './assets/logo.png';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);

  // Fetch real public articles from backend
  useEffect(() => {
    fetch(`${API}/api/articles/public`)
      .then(r => r.json())
      .then(data => {
        setArticles(Array.isArray(data) ? data : []);
        setArticlesLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch articles:', err);
        setArticlesLoading(false);
      });
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set();
    articles.forEach(article => (article.tags || []).forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [articles]);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const PRIMARY_COLOR = 'rgb(126, 34, 206)';
  const ACCENT_COLOR  = 'rgb(249, 115, 22)';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7e22ce] via-[#be185d] to-[#fb923c]">

      {/* HEADER */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Branding */}
            <div className="flex items-center space-x-2">
              <img src={logo} alt="Project REVEAL Logo" className="h-12 w-12 object-contain" />
              <span className="text-3xl font-extrabold" style={{ color: PRIMARY_COLOR }}>PROJECT</span>
              <span className="text-3xl font-extrabold" style={{ color: ACCENT_COLOR }}>REVEAL</span>
            </div>

            {/* PUBLIC NAV — Admin link intentionally removed */}
            {/* Admin is accessed via /admin directly, not linked publicly */}
            <nav className="flex space-x-4">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-full transition-all text-lg font-medium ${
                    isActive
                      ? 'bg-fuchsia-100 text-fuchsia-700'
                      : 'text-gray-600 hover:text-fuchsia-700 hover:bg-fuchsia-50'
                  }`
                }
              >
                <HomeIcon className="h-5 w-5" />
                <span>Home</span>
              </NavLink>

              <NavLink
                to="/browse"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-full transition-all text-lg font-medium ${
                    isActive
                      ? 'bg-fuchsia-100 text-fuchsia-700'
                      : 'text-gray-600 hover:text-fuchsia-700 hover:bg-fuchsia-50'
                  }`
                }
              >
                <Search className="h-5 w-5" />
                <span>Browse Articles</span>
              </NavLink>

              {/* Admin portal: accessible at /admin but NOT linked here.
                  If you ever want a subtle link back, uncomment: */}
              {/*
              <NavLink to="/admin" className="...">
                <User className="h-5 w-5" />
                <span>Admin</span>
              </NavLink>
              */}
            </nav>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="bg-purple-50 rounded-xl shadow-2xl p-6">
          <Routes>
            <Route path="/" element={<Home logo={logo} />} />

            <Route
              path="/browse"
              element={
                <BrowseArticles
                  articles={articles}
                  allTags={allTags}
                  speakText={speakText}
                  loading={articlesLoading}
                />
              }
            />

            {/* Admin portal — no auth redirect needed here, AdminPortal handles it internally */}
            <Route path="/admin" element={<AdminPortal />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;