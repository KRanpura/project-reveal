import React from 'react';
import { Search, Download, Play, MapPin } from 'lucide-react';

const BrowseTab = ({ articles, searchTerm, setSearchTerm, speakText }) => {
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Browse Archive</h2>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles, topics, or tags..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6">
        {filteredArticles.map(article => (
          <div key={article.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-semibold text-gray-900">{article.title}</h3>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {article.category}
              </span>
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed">{article.summary}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  onClick={() => window.open(article.url, '_blank')}
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>

                <button 
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => speakText(article.summary)}
                >
                  <Play className="h-4 w-4" />
                  <span>Listen</span>
                </button>
              </div>

              <div className="text-sm text-gray-500">
                <MapPin className="inline h-4 w-4 mr-1" />
                {article.state} • {new Date(article.dateAdded).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseTab;