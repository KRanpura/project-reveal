import React, { useState, useMemo } from 'react';
import { Search, Download, Play, Tag, XCircle } from 'lucide-react';

// Destructure articles, the complete list of unique tags, and speakText prop
const BrowseArticles = ({ articles, allTags, speakText }) => {
  // State for the regular search bar (keyword search in title/abstract)
  const [searchTerm, setSearchTerm] = useState('');
  // State for the tag-based filter
  const [selectedTag, setSelectedTag] = useState(null);

  // Use useMemo to filter articles efficiently only when search or tag changes
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      // 1. Check for keyword match (title or summary)
      const keywordMatch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Check for tag match (if a tag is selected)
      const tagMatch = selectedTag ? article.tags.includes(selectedTag) : true;
      
      return keywordMatch && tagMatch;
    });
  }, [articles, searchTerm, selectedTag]);

  const handleTagClick = (tag) => {
    // Toggle the selected tag
    setSelectedTag(prevTag => (prevTag === tag ? null : tag));
    // Clear keyword search when selecting a tag
    setSearchTerm('');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Clear tag filter when typing in the search bar
    setSelectedTag(null);
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">📚 Browse Public Health Archive</h2>

      {/* Search and Filter Controls */}
      <div className="bg-gray-50 p-6 rounded-xl shadow-inner mb-8">
        {/* Keyword Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by keyword in title or abstract..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-fuchsia-500 focus:border-fuchsia-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Tag Filter Area */}
        <div className="flex items-center flex-wrap gap-2">
          <Tag className="h-5 w-5 text-fuchsia-600 mr-1 flex-shrink-0" />
          <span className="font-semibold text-gray-700 mr-2">Filter by Tag:</span>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`
                text-sm px-3 py-1 rounded-full transition-colors font-medium
                ${selectedTag === tag
                  ? 'bg-fuchsia-600 text-white hover:bg-fuchsia-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              #{tag}
            </button>
          ))}
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="text-sm px-3 py-1 ml-4 flex items-center text-red-600 hover:text-red-800"
            >
              <XCircle className="h-4 w-4 mr-1" /> Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Article List */}
      <div className="grid gap-6">
        {filteredArticles.length > 0 ? (
          filteredArticles.map(article => (
            <div key={article.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-2xl font-bold text-gray-900 leading-snug">{article.title}</h3>
                <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0">
                  {article.category}
                </span>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed italic">{article.summary}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.map(tag => (
                  <span key={tag} className="bg-fuchsia-100 text-fuchsia-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-3">
                  <button 
                    className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors shadow-md"
                    onClick={() => window.open(article.url, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                    <span>View Article</span>
                  </button>

                  <button 
                    className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 transition-colors shadow-md"
                    onClick={() => speakText(article.summary)}
                  >
                    <Play className="h-4 w-4" />
                    <span>Listen Summary</span>
                  </button>
                </div>

                <div className="text-sm text-gray-500">
                  {article.state} • Added {new Date(article.dateAdded).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            <Search className="h-10 w-10 mx-auto mb-3" />
            <p className="text-xl">No articles match your current search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseArticles;