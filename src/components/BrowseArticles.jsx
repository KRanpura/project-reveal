import React, { useState } from 'react';
import ArticleCard from './ArticleCard';

export default function BrowseArticles({ articles, allTags, speakText }) {
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOriginalAll, setShowOriginalAll] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  if (!articles || articles.length === 0) {
    return <p className="text-gray-700">No public articles available.</p>;
  }

  const filteredArticles = articles.filter(article => {
    const matchesTag = selectedTag ? article.tags?.includes(selectedTag) : true;
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch =
      query === '' ||
      [
        article.doc_title,
        article.final_abstract,
        article.original_abstract,
        article.source,
        ...(article.tags || []),
      ]
        .filter(Boolean)
        .some(field => field.toLowerCase().includes(query));

    return matchesTag && matchesSearch;
  });

  // helper: format tag nicely
  const formatTag = (tag) =>
    tag
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const visibleTags = showAllTags ? allTags : allTags.slice(0, 10);

  return (
    <div>
      {/* SEARCH BAR */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by title, abstract, source, or tag…"
          className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl text-base text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
        />
      </div>

      {/* TAG FILTERS + GLOBAL ABSTRACT TOGGLE */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 items-center">
          <button
            className={`px-3 py-1 rounded-md ${
              selectedTag === null
                ? 'bg-purple-600 text-white'
                : 'bg-purple-200 text-purple-800'
            }`}
            onClick={() => setSelectedTag(null)}
          >
            All
          </button>

          {visibleTags.map(tag => (
            <button
              key={tag}
              className={`px-3 py-1 rounded-md ${
                selectedTag === tag
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-200 text-purple-800'
              }`}
              onClick={() => setSelectedTag(tag)}
            >
              {formatTag(tag)}
            </button>
          ))}

          {allTags.length > 10 && (
            <button
              onClick={() => setShowAllTags(prev => !prev)}
              className="text-sm text-purple-600 hover:text-purple-800 ml-2"
            >
              {showAllTags ? 'See Less' : 'See More'}
            </button>
          )}
        </div>

        {/* GLOBAL TOGGLE */}
        <button
          onClick={() => setShowOriginalAll(prev => !prev)}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
            showOriginalAll
              ? 'bg-amber-100 border-amber-400 text-amber-800'
              : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span>{showOriginalAll ? '✏️' : '🤖'}</span>
          {showOriginalAll
            ? 'Showing original abstracts'
            : 'Show original abstracts'}
        </button>
      </div>

      {/* RESULTS COUNT */}
      <p className="text-sm text-gray-400 mb-3">
        {filteredArticles.length}{' '}
        {filteredArticles.length === 1 ? 'article' : 'articles'} found
      </p>

      {/* ARTICLES GRID */}
      {filteredArticles.length > 0 ? (
        <div className="grid gap-4">
          {filteredArticles.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              speakText={speakText}
              forceOriginal={showOriginalAll}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">
          No articles match your search.
        </p>
      )}
    </div>
  );
}