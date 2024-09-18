import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    // Example validation for file type
    if (selectedFile && selectedFile.type !== 'text/csv') {
      setError('Only CSV files are allowed.');
      setFile(null);
    } else {
      setFile(selectedFile);
      setError(null);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSummary(response.data.summary);
      setError(null);
    } catch (error) {
      setError('File upload failed.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload CSV File</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {summary && (
        <div>
          <h3>Summary Statistics</h3>
          <pre>{JSON.stringify(summary, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default FileUpload;