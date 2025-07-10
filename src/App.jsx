import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Search, MapPin, Upload, User } from 'lucide-react';
import BrowseTab from './components/BrowseTab';
import MapTab from './components/MapTab';
import UploadTab from './components/UploadTab';
// Mock data
const mockArticles = [
  {
    id: 1,
    title: "Climate Change Impact on Coastal Communities",
    url: "https://example.com/climate-article",
    summary: "This comprehensive report examines how rising sea levels and extreme weather events are affecting coastal populations across the United States. The study reveals that over 630,000 properties are at risk of chronic flooding by 2045.",
    category: "Environment",
    state: "FL",
    dateAdded: "2024-12-15",
    tags: ["climate", "coastal", "flooding"]
  },
  {
    id: 2,
    title: "Housing Affordability Crisis in Major Cities",
    url: "https://example.com/housing-crisis",
    summary: "Analysis of housing market trends showing that median home prices have increased 40% since 2020, while wages have only grown 12%. The report highlights policy recommendations for addressing the affordability gap.",
    category: "Housing",
    state: "CA",
    dateAdded: "2024-12-10",
    tags: ["housing", "affordability", "urban"]
  },
  {
    id: 3,
    title: "Education Funding Disparities Report",
    url: "https://example.com/education-funding",
    summary: "Federal investigation reveals significant funding gaps between school districts, with low-income areas receiving 17% less per-pupil funding than wealthy districts. The report calls for legislative action to ensure equitable education access.",
    category: "Education",
    state: "TX",
    dateAdded: "2024-12-05",
    tags: ["education", "funding", "inequality"]
  }
];

const mockStateData = {
  "CA": {
    name: "California",
    homelessPopulation: 181399,
    womenRightsBills: 12,
    environmentalRisks: "High wildfire risk, drought conditions",
    articles: 45
  },
  "TX": {
    name: "Texas",
    homelessPopulation: 27377,
    womenRightsBills: 8,
    environmentalRisks: "Hurricane risk, extreme heat",
    articles: 32
  },
  "FL": {
    name: "Florida",
    homelessPopulation: 25959,
    womenRightsBills: 6,
    environmentalRisks: "Sea level rise, hurricane risk",
    articles: 28
  },
  "NY": {
    name: "New York",
    homelessPopulation: 91271,
    womenRightsBills: 15,
    environmentalRisks: "Coastal flooding, extreme weather",
    articles: 52
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
            element={
              <UploadTab
                isAdmin={isAdmin}
                setIsAdmin={setIsAdmin}
              />
            }
          />
          <Route path="*" element={<Navigate to="/browse" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;