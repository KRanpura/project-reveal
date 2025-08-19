import React, { useState } from 'react';
import { Shield, Upload, FileText, Check, X } from 'lucide-react';

const UploadTab = ({ isAdmin, setIsAdmin }) => {
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: '',
    state: '',
    tags: '',
    summary: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setUploadStatus(null);
    } else {
      alert('Please select a PDF file');
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select a PDF file');
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      // Step 1: Get upload URL from your backend
      const uploadUrlResponse = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type, // Add this line
        }),
      });

      if (!uploadUrlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl } = await uploadUrlResponse.json();

      // Step 2: Upload file directly to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: { 'Content-Type': 'application/pdf' }
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // Step 3: Save metadata to your database
      const metadataResponse = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadForm.title,
          category: uploadForm.category,
          state: uploadForm.state,
          tags: uploadForm.tags.split(',').map(tag => tag.trim()),
          summary: uploadForm.summary,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
          s3Key: `uploads/${selectedFile.name}`
        })
      });

      if (!metadataResponse.ok) {
        throw new Error('Failed to save document metadata');
      }

      setUploadStatus('success');
      // Reset form
      setUploadForm({
        title: '',
        category: '',
        state: '',
        tags: '',
        summary: ''
      });
      setSelectedFile(null);
      // Reset file input
      document.getElementById('pdf-upload').value = '';

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
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
      <h2 className="text-2xl font-bold mb-6">Upload New PDF Document</h2>
      
      {/* Upload Status Messages */}
      {uploadStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <Check className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800">Document uploaded successfully!</span>
        </div>
      )}
      
      {uploadStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <X className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">Upload failed. Please try again.</span>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">PDF Document</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              id="pdf-upload"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              required
            />
            <label htmlFor="pdf-upload" className="cursor-pointer">
              {selectedFile ? (
                <div className="flex items-center justify-center">
                  <FileText className="h-8 w-8 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">{selectedFile.name}</span>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-600">Click to select PDF file</span>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Document Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Document Title</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={uploadForm.title}
            onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
            required
          />
        </div>

        {/* Summary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={uploadForm.summary}
            onChange={(e) => setUploadForm({ ...uploadForm, summary: e.target.value })}
            placeholder="Brief description of the document..."
          />
        </div>

        {/* Category and State */}
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

        {/* Tags */}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
            uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>
    </div>
  );
};

export default UploadTab;