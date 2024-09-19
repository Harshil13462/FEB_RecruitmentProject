import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);  // Set uploading state to true
      setError(null);  // Clear any previous error
      setSummary(null);  // Clear any previous summary

      // Send POST request to Flask backend
      const response = await axios.post('http://localhost:4000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSummary(response.data.summary);  // Set the summary response
    } catch (error) {
      setError('File upload failed. Please try again.');
      console.error(error);
    } finally {
      setUploading(false);  // Set uploading state to false
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">Upload CSV File</h2>

      <div className="mt-3">
        {/* File Input */}
        <input
          className="form-control mb-3"
          type="file"
          onChange={handleFileChange}
          accept=".csv"
        />

        {/* Upload Button */}
        <button
          className="btn btn-primary w-100"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>

        {/* Upload Progress or Error Messages */}
        {uploading && (
          <div className="alert alert-info mt-3" role="alert">
            Uploading file... please wait.
          </div>
        )}

        {error && (
          <div className="alert alert-danger mt-3" role="alert">
            {error}
          </div>
        )}

        {/* Summary Statistics Display */}
        {summary && (
          <div className="mt-5">
            <h4>Summary Statistics</h4>
            <pre>{JSON.stringify(summary, null, 2)}</pre>
          </div>
        )}

        {/* Redirect to Home Button */}
        <button
          className="btn btn-secondary w-100 mt-3"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default FileUpload;