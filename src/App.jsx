import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Search, MapPin, Upload, User } from 'lucide-react';
import BrowseTab from './components/BrowseTab';
import MapTab from './components/MapTab';
import UploadTab from './components/UploadTab';

// Mock data (health-related)
const mockArticles = [
  {
    id: 1,
    title: "Rising HIV Rates Among Young Adults",
    url: "https://example.com/hiv-awareness",
    summary:
      "New CDC data shows an uptick in HIV diagnoses among people aged 18–24. Experts stress the importance of early testing, education, and equitable access to PrEP medication.",
    category: "HIV/AIDS",
    state: "CA",
    dateAdded: "2025-01-10",
    tags: ["HIV", "PrEP", "youth", "testing"]
  },
  {
    id: 2,
    title: "Access to Abortion Care Faces New Challenges",
    url: "https://example.com/abortion-access-report",
    summary:
      "Following recent legislation, abortion care availability continues to vary across states. Telehealth services have become critical for those seeking reproductive healthcare in restricted areas.",
    category: "Reproductive Health",
    state: "TX",
    dateAdded: "2025-01-05",
    tags: ["abortion", "telehealth", "reproductive rights", "policy"]
  },
  {
    id: 3,
    title: "Untreated STDs Increasing Infertility Risks in Women",
    url: "https://example.com/std-infertility",
    summary:
      "Doctors warn that untreated STDs like chlamydia and gonorrhea can cause pelvic inflammatory disease and infertility, underscoring the need for regular screenings and awareness.",
    category: "STDs",
    state: "NY",
    dateAdded: "2024-12-25",
    tags: ["STDs", "infertility", "screening", "women's health"]
  },
  {
    id: 4,
    title: "Teen Pregnancy Rates Drop Amid Better Sex Education",
    url: "https://example.com/teen-pregnancy-decline",
    summary:
      "The national teen pregnancy rate has dropped 15% in the past five years. Experts attribute the decline to improved access to contraception and comprehensive sex education in schools.",
    category: "Pregnancy",
    state: "FL",
    dateAdded: "2024-12-18",
    tags: ["pregnancy", "education", "contraception", "youth"]
  },
  {
    id: 5,
    title: "Fighting HIV Stigma in Rural Communities",
    url: "https://example.com/hiv-stigma",
    summary:
      "Community-led initiatives are tackling HIV stigma in rural regions, improving access to testing, treatment, and mental health support through local outreach and education programs.",
    category: "Public Health",
    state: "TX",
    dateAdded: "2024-12-12",
    tags: ["HIV", "rural", "stigma", "community health"]
  }
];

// Mock state data (health metrics)
const mockStateData = {
  "CA": {
    name: "California",
    reproductiveHealthClinics: 142,
    hivPrevalenceRate: "0.38%",
    abortionAccessScore: "High",
    articles: 58
  },
  "TX": {
    name: "Texas",
    reproductiveHealthClinics: 65,
    hivPrevalenceRate: "0.27%",
    abortionAccessScore: "Low",
    articles: 44
  },
  "FL": {
    name: "Florida",
    reproductiveHealthClinics: 81,
    hivPrevalenceRate: "0.43%",
    abortionAccessScore: "Moderate",
    articles: 39
  },
  "NY": {
    name: "New York",
    reproductiveHealthClinics: 119,
    hivPrevalenceRate: "0.54%",
    abortionAccessScore: "High",
    articles: 61
  }
};

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech not supported in your browser');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <img src="./assets/logo.png" alt="Project Reveal Logo" className="h-10 w-auto" />
            <h1 className="text-xl font-bold text-gray-900">Project Reveal</h1>
            <nav className="flex space-x-8">
              <NavLink
                to="/browse"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                <Search className="h-4 w-4" />
                <span>Browse</span>
              </NavLink>
              <NavLink
                to="/map"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                <MapPin className="h-4 w-4" />
                <span>Map</span>
              </NavLink>
              <NavLink
                to="/upload"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </NavLink>
            </nav>
            {isAdmin && (
              <div className="flex items-center space-x-2 text-green-600">
                <User className="h-4 w-4" />
                <span className="text-sm">Admin</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto">
        <Routes>
          <Route
            path="/browse"
            element={
              <BrowseTab
                articles={mockArticles}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                speakText={speakText}
              />
            }
          />
          <Route
            path="/map"
            element={
              <MapTab
                stateData={mockStateData}
                selectedState={selectedState}
                setSelectedState={setSelectedState}
              />
            }
          />
          <Route
            path="/upload"
            element={<UploadTab isAdmin={isAdmin} setIsAdmin={setIsAdmin} />}
          />
          <Route path="*" element={<Navigate to="/browse" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
