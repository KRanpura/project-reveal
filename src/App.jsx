import React, { useState, useMemo } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Home as HomeIcon, Search, User } from 'lucide-react';

import Home from './components/Home';
import BrowseArticles from './components/BrowseArticles';
import AdminPortal from './components/AdminPortal';

import logo from './assets/logo.png'; // added logo import

// Mock data
const mockArticles = [ 
  { id: 1, 
    title: "Rising HIV Rates Among Young Adults", 
    url: "https://example.com/hiv-awareness", 
    summary: "New CDC data shows an uptick in HIV diagnoses among people aged 18–24. Experts stress the importance of early testing, education, and equitable access to PrEP medication.", 
    category: "HIV/AIDS", 
    state: "CA", 
    dateAdded: "2025-01-10", 
    tags: ["HIV", "PrEP", "youth", "testing"] }, 

  { id: 2, title: "Access to Abortion Care Faces New Challenges", 
    url: "https://example.com/abortion-access-report", 
    summary: "Following recent legislation, abortion care availability continues to vary across states. Telehealth services have become critical for those seeking reproductive healthcare in restricted areas.", 
    category: "Reproductive Health", 
    state: "TX", 
    dateAdded: "2025-01-05", 
    tags: ["abortion", "telehealth", "reproductive rights", "policy"] }, 
  
  { id: 3, title: "Untreated STDs Increasing Infertility Risks in Women", 
    url: "https://example.com/std-infertility", 
    summary: "Doctors warn that untreated STDs like chlamydia and gonorrhea can cause pelvic inflammatory disease and infertility, underscoring the need for regular screenings and awareness.", 
    category: "STDs",
    state: "NY",
    dateAdded: "2024-12-25", 
    tags: ["STDs", "infertility", "screening", "women's health"] },
  
  { id: 4, title: "Teen Pregnancy Rates Drop Amid Better Sex Education", 
    url: "https://example.com/teen-pregnancy-decline", 
    summary: "The national teen pregnancy rate has dropped 15% in the past five years. Experts attribute the decline to improved access to contraception and comprehensive sex education in schools.", 
    category: "Pregnancy", 
    state: "FL", 
    dateAdded: "2024-12-18", 
    tags: ["pregnancy", "education", "contraception", "youth"] }, 
    
  { id: 5, title: "Fighting HIV Stigma in Rural Communities", 
    url: "https://example.com/hiv-stigma", 
    summary: "Community-led initiatives are tackling HIV stigma in rural regions, improving access to testing, treatment, and mental health support through local outreach and education programs.", 
    category: "Public Health", 
    state: "TX", 
    dateAdded: "2024-12-12", 
    tags: ["HIV", "rural", "stigma", "community health"] } ];

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  const allTags = useMemo(() => {
    const tags = new Set();
    mockArticles.forEach(article => {
      article.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, []);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const PRIMARY_COLOR = 'rgb(126, 34, 206)';
  const ACCENT_COLOR = 'rgb(249, 115, 22)';

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

            {/* NAVIGATION */}
            <nav className="flex space-x-4">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-full transition-all text-lg font-medium ${
                    isActive ? 'bg-fuchsia-100 text-fuchsia-700'
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
                    isActive ? 'bg-fuchsia-100 text-fuchsia-700'
                             : 'text-gray-600 hover:text-fuchsia-700 hover:bg-fuchsia-50'
                  }`
                }
              >
                <Search className="h-5 w-5" />
                <span>Browse Articles</span>
              </NavLink>

              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-full transition-all text-lg font-medium ${
                    isActive ? 'bg-fuchsia-100 text-fuchsia-700'
                             : 'text-gray-600 hover:text-fuchsia-700 hover:bg-fuchsia-50'
                  }`
                }
              >
                <User className="h-5 w-5" />
                <span>Admin Portal</span>
              </NavLink>
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
                  articles={mockArticles}
                  allTags={allTags}
                  speakText={speakText}
                />
              }
            />

            <Route path="/admin" element={<AdminPortal />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
