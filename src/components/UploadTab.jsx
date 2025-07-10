import React, { useState } from 'react';
import { Shield } from 'lucide-react';

const UploadTab = ({ isAdmin, setIsAdmin }) => {
  const [uploadForm, setUploadForm] = useState({
    title: '',
    url: '',
    category: '',
    state: '',
    tags: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Upload functionality will be implemented in Week 3!');
    console.log('Upload form data:', uploadForm);
  };

  if (!isAdmin) {
    return (
      <div className="p-6 text-center">
        <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
        <p className="text-gray-600 mb-6">You need admin privileges to upload content.</p>
        <button
          onClick={() => setIsAdmin(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign In as Admin (Demo)
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Upload New Article</h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Article Title</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={uploadForm.title}
            onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Source URL</label>
          <input
            type="url"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={uploadForm.url}
            onChange={(e) => setUploadForm({ ...uploadForm, url: e.target.value })}
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={uploadForm.category}
              onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
              required
            >
              <option value="">Select category</option>
              <option value="Environment">Environment</option>
              <option value="Housing">Housing</option>
              <option value="Education">Education</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Politics">Politics</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={uploadForm.state}
              onChange={(e) => setUploadForm({ ...uploadForm, state: e.target.value })}
              required
            >
              <option value="">Select state</option>
              <option value="CA">California</option>
              <option value="TX">Texas</option>
              <option value="FL">Florida</option>
              <option value="NY">New York</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
          <input
            type="text"
            placeholder="climate, policy, research"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={uploadForm.tags}
            onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Upload Article
        </button>
      </form>
    </div>
  );
};

export default UploadTab;