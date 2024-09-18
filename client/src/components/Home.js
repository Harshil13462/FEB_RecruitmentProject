import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Link } from 'react-router-dom';  // Import for navigation
import axios from 'axios';

const Home = () => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [variables, setVariables] = useState([]);
  const [selectedXVariable, setSelectedXVariable] = useState('');
  const [selectedYVariable, setSelectedYVariable] = useState('');
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    fetchDatasets();
  }, []);

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

  useEffect(() => {
    if (selectedXVariable && selectedYVariable && data.length > 0) {
      const xValues = data.map(item => item[selectedXVariable]);
      const yValues = data.map(item => item[selectedYVariable]);

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

  return (
    <div className="container mt-4">
      <h2 className="text-center">Racecar Data Visualization</h2>

      <div className="text-center mt-3">
        <Link to="/upload" className="btn btn-primary">
          Upload New Dataset
        </Link>
      </div>

      <div className="mt-5">
        <h4>Select a Dataset</h4>
        {datasets && datasets.length > 0 ? (
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

        {error && <p style={{ color: 'red' }}>{error}</p>}

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

        {chartData && (
          <div className="mt-5">
            <h5>Graph</h5>
            <Line data={chartData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
