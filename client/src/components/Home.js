import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import axios from 'axios';

const Home = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [variables, setVariables] = useState([]);
  const [selectedXVariable, setSelectedXVariable] = useState('');
  const [selectedYVariable, setSelectedYVariable] = useState('');
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState(null);

  // Fetch the list of datasets
  const fetchDatasets = async () => {
    try {
      const response = await axios.get('http://localhost:4000/datasets');
      setDatasets(response.data.datasets);
      setError(null);
    } catch (error) {
      setError('Error fetching datasets.');
      console.error('Error fetching datasets:', error);
    }
  };

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
      setUploading(true);
      setError(null);  // Clear any previous errors

      // Send POST request to Flask backend
      const response = await axios.post('http://localhost:4000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploading(false);
      fetchDatasets();  // Refresh the dataset list after upload
    } catch (error) {
      setError('File upload failed. Please try again.');
      setUploading(false);
      console.error(error);
    }
  };

  // Fetch dataset variables when a dataset is selected
  const handleDatasetSelect = async (e) => {
    const dataset = e.target.value;
    setSelectedDataset(dataset);

    try {
      const response = await axios.get(`http://localhost:4000/data/${dataset}`);
      const data = response.data.data;

      if (data && data.length > 0) {
        const variables = Object.keys(data[0]);
        setVariables(variables);
        setData(data);
        setError(null);
      } else {
        setError('No data available in the selected dataset.');
      }
    } catch (error) {
      setError('Error fetching dataset variables.');
      console.error('Error fetching dataset variables:', error);
    }
  };

  // Update chart data when variables are selected
  useEffect(() => {
    if (selectedXVariable && selectedYVariable && data.length > 0) {
      const xValues = data.map(item => parseFloat(item[selectedXVariable]));
      const yValues = data.map(item => parseFloat(item[selectedYVariable]));

      setChartData({
        labels: xValues,
        datasets: [
          {
            label: `${selectedYVariable} vs ${selectedXVariable}`,
            data: yValues,
            fill: false,
            borderColor: 'rgba(75,192,192,1)',
            tension: 0.1,
          },
        ],
      });
    }
  }, [selectedXVariable, selectedYVariable, data]);

  // Chart options with linear X-axis and constant tick intervals
  const chartOptions = {
    scales: {
      x: {
        type: 'linear',  // Ensure X-axis is numerical
        ticks: {
          autoSkip: true,
          stepSize: ((Math.max(...chartData?.labels || [0]) - Math.min(...chartData?.labels || [0])) * 1.01) / 10, // Step size based on the range of values
        },
        title: {
          display: true,
          text: selectedXVariable || 'X Variable',
        },
      },
      y: {
        title: {
          display: true,
          text: selectedYVariable || 'Y Variable',
        },
      },
    },
  };

  // Fetch datasets on component mount
  useEffect(() => {
    fetchDatasets();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="text-center">Racecar Data Visualization & Upload</h2>

      {/* File Upload Section */}
      <div className="mt-3">
        <h4>Upload CSV File</h4>
        <input
          className="form-control mb-3"
          type="file"
          onChange={handleFileChange}
          accept=".csv"
        />
        <button
          className="btn btn-primary w-100"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>

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
      </div>

      {/* Dataset Selection Section */}
      <div className="mt-5">
        <h4>Select a Dataset</h4>
        {datasets.length > 0 ? (
          <select className="form-select" onChange={handleDatasetSelect}>
            <option value="">Select a dataset</option>
            {datasets.map((dataset, index) => (
              <option key={index} value={dataset}>
                {dataset}
              </option>
            ))}
          </select>
        ) : (
          <p>No datasets available</p>
        )}

        {variables.length > 0 && (
          <div className="mt-4">
            <h5>Select Variables</h5>
            <div className="row">
              <div className="col-md-6">
                <label>X-axis</label>
                <select
                  className="form-select"
                  onChange={(e) => setSelectedXVariable(e.target.value)}
                  value={selectedXVariable}
                >
                  <option value="">Select X Variable</option>
                  {variables.map((variable, index) => (
                    <option key={index} value={variable}>
                      {variable}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label>Y-axis</label>
                <select
                  className="form-select"
                  onChange={(e) => setSelectedYVariable(e.target.value)}
                  value={selectedYVariable}
                >
                  <option value="">Select Y Variable</option>
                  {variables.map((variable, index) => (
                    <option key={index} value={variable}>
                      {variable}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Chart Visualization Section */}
        {chartData && (
          <div className="mt-5">
            <h5>Graph</h5>
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
