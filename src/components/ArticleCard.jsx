import React, { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ArticleCard({ article, speakText, forceOriginal = false }) {
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  // Per-card toggle overrides global only if user has explicitly toggled this card
  const [cardOverridden, setCardOverridden] = useState(false);

  // reset card override when global toggle changes
  useEffect(() => {
    setCardOverridden(false);
  }, [forceOriginal]);

  const displayOriginal = cardOverridden ? showOriginal : forceOriginal;

  const hasAIAbstract = !!article.final_abstract;
  const hasOriginal = !!article.original_abstract;

  const displayedAbstract = displayOriginal
    ? article.original_abstract
    : (article.final_abstract || article.original_abstract);

  const getSignedUrl = async () => {
    const res = await fetch(`${API}/api/articles/${article.id}/preview`);
    if (!res.ok) throw new Error('Failed to fetch preview URL');
    const data = await res.json();
    if (!data.signedUrl) throw new Error('No signed URL returned');
    return data.signedUrl;
  };

  const handlePreview = async () => {
    setLoading(true);
    const newTab = window.open('', '_blank'); // open immediately, before await
    try {
      const url = await getSignedUrl();
      newTab.location.href = url;
    } catch (err) {
      console.error('Preview failed:', err);
      newTab.close();
      alert('Could not load preview. The file may not be available.');
    } finally {
      setLoading(false);
    }
  };


  const handleReadAloud = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const text = displayedAbstract || '';
    if (!text) return;
    if (speakText) {
      speakText(text);
      setSpeaking(true);
      const wordCount = text.split(' ').length;
      const estimatedMs = (wordCount / 0.8) * 1000;
      setTimeout(() => setSpeaking(false), estimatedMs);
    }
  };

  const handleCardToggle = () => {
    setShowOriginal(!displayOriginal);
    setCardOverridden(true);
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-bold text-gray-900 leading-snug">{article.doc_title}</h2>

      {/* Abstract */}
      {displayedAbstract && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              {displayOriginal ? '✏️ Original abstract' : '🤖 AI-edited abstract'}
            </span>
            {hasAIAbstract && hasOriginal && (
              <button
                onClick={handleCardToggle}
                className="text-xs text-purple-600 hover:text-purple-800 underline"
              >
                {displayOriginal ? 'Show AI version' : 'Show original'}
              </button>
            )}
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {displayedAbstract}
          </p>
        </div>
      )}

      {/* Tags */}
      {article.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {article.tags.map(tag => (
            <span key={tag} className="bg-purple-50 text-purple-700 border border-purple-100 text-xs font-medium px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Date */}
      {article.created_at && (
        <p className="text-xs text-gray-400 mt-2">
          Added {new Date(article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={handlePreview}
          disabled={loading}
          className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? 'Loading…' : '👁 View'}
        </button>

        <button
          onClick={handleReadAloud}
          className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            speaking
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {speaking ? '⏹ Stop' : '🔊 Read Aloud'}
        </button>
      </div>
    </div>
  );
}