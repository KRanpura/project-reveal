import React, { useState } from 'react';
import ArticleCard from './ArticleCard';

export default function BrowseArticles({ articles, allTags, speakText }) {
  const [selectedTag, setSelectedTag] = useState(null);

  if (!articles || articles.length === 0) {
    return <p className="text-gray-700">No public articles available.</p>;
  }

  // Filter articles by selected tag
  const filteredArticles = selectedTag
    ? articles.filter(article => article.tags?.includes(selectedTag))
    : articles;

  return (
    <div>
      {/* TAG FILTERS */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          className={`px-3 py-1 rounded-md ${
            selectedTag === null ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-800'
          }`}
          onClick={() => setSelectedTag(null)}
        >
          All
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            className={`px-3 py-1 rounded-md ${
              selectedTag === tag ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-800'
            }`}
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* ARTICLES GRID */}
      <div className="grid gap-4">
        {filteredArticles.map(article => (
          <ArticleCard key={article.id} article={article} speakText={speakText} />
        ))}
      </div>
    </div>
  );
}
