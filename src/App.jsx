import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate, Link } from 'react-router-dom';
import { Search, Info, ChevronDown } from 'lucide-react';

import Home from './components/Home';
import BrowseArticles from './components/BrowseArticles';
import AdminPortal from './components/AdminPortal';
import About from './components/About';

import logo from './assets/logo.png';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ABOUT_SECTIONS = [
  { label: 'Mission',          anchor: 'mission' },
  { label: 'REVEAL Manifesto', anchor: 'reveal-manifesto' },
  { label: 'Design Decisions', anchor: 'design-decisions' },
  { label: 'Contributor Bios', anchor: 'contributor-bios' },
];

function AboutDropdown() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  const handleSectionClick = (anchor) => {
    setOpen(false);
    navigate('/about');
    setTimeout(() => {
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <NavLink
        to="/about"
        className={({ isActive }) =>
          `flex items-center space-x-2 px-3 py-2 rounded-full transition-all text-lg font-medium ${
            isActive
              ? 'bg-fuchsia-100 text-fuchsia-700'
              : 'text-gray-600 hover:text-fuchsia-700 hover:bg-fuchsia-50'
          }`
        }
      >
        <Info className="h-5 w-5" />
        <span>About REVEAL</span>
        <ChevronDown
          className="h-4 w-4 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </NavLink>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-purple-100 py-1 z-50"
          style={{ animation: 'fadeSlideDown 0.15s ease-out' }}
        >
          {ABOUT_SECTIONS.map((section) => (
            <button
              key={section.anchor}
              onClick={() => handleSectionClick(section.anchor)}
              className="w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:bg-fuchsia-50 hover:text-fuchsia-700 transition-colors"
            >
              {section.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function App() {
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');

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
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="Project REVEAL Logo" className="h-12 w-12 object-contain" />
              <span className="text-3xl font-extrabold" style={{ color: PRIMARY_COLOR }}>PROJECT</span>
              <span className="text-3xl font-extrabold" style={{ color: ACCENT_COLOR }}>REVEAL</span>
            </Link>

            {/* NAV */}
            <nav className="flex items-center space-x-4">
              <AboutDropdown />

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
            </nav>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="bg-purple-50 rounded-xl shadow-2xl p-6 ring-4 ring-purple-200">
          <Routes>
            <Route
              path="/"
              element={<Home logo={logo} onSearch={(q) => { setGlobalSearch(q); }} />}
            />
            <Route
              path="/browse"
              element={
                <BrowseArticles
                  articles={articles}
                  allTags={allTags}
                  speakText={speakText}
                  loading={articlesLoading}
                  searchQuery={globalSearch}
                  onSearchChange={setGlobalSearch}
                />
              }
            />
            <Route path="/about" element={<About logo={logo} />} />
            <Route path="/admin" element={<AdminPortal />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;