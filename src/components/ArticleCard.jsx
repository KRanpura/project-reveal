import React, { useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ArticleCard({ article, speakText }) {
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const getSignedUrl = async () => {
    const res = await fetch(`${API}/api/articles/${article.id}/preview`);
    if (!res.ok) throw new Error('Failed to fetch preview URL');
    const data = await res.json();
    if (!data.signedUrl) throw new Error('No signed URL returned');
    return data.signedUrl;
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      const url = await getSignedUrl();
      window.open(url, '_blank');
    } catch (err) {
      console.error('Preview failed:', err);
      alert('Could not load preview. The file may not be available.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const url = await getSignedUrl();
      const link = document.createElement('a');
      link.href = url;
      link.download = `${article.doc_title || 'document'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Could not download file. The file may not be available.');
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
    const text = article.final_abstract || article.original_abstract || '';
    if (!text) return;
    if (speakText) {
      speakText(text);
      setSpeaking(true);
      // Reset speaking state when done — estimate based on word count
      const wordCount = text.split(' ').length;
      const estimatedMs = (wordCount / 0.8) * 1000; // ~0.8 words/sec at rate 0.8
      setTimeout(() => setSpeaking(false), estimatedMs);
    }
  };

  const hasFile = !!article.s3_key || true; // assume file exists; 404 handled gracefully

  return (
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-bold text-gray-900 leading-snug">{article.doc_title}</h2>

      {/* Abstract */}
      {(article.final_abstract || article.original_abstract) && (
        <p className="text-gray-600 mt-2 text-sm leading-relaxed line-clamp-3">
          {article.final_abstract || article.original_abstract}
        </p>
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
          {loading ? 'Loading…' : '👁 Preview'}
        </button>

        <button
          onClick={handleDownload}
          disabled={loading}
          className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? 'Loading…' : '⬇ Download'}
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