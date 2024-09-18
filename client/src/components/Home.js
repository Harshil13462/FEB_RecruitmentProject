import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const Home = () => {
  const [datasets, setDatasets] = useState([]);  // List of datasets
  const [selectedDataset, setSelectedDataset] = useState('');
  const [variables, setVariables] = useState([]);  // List of variables (columns)
  const [selectedXVariable, setSelectedXVariable] = useState('');  // Selected variable for x-axis
  const [selectedYVariable, setSelectedYVariable] = useState('');  // Selected variable for y-axis
  const [data, setData] = useState([]);  // Full dataset (fetched)
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);  // Data for the chart

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const response = await axios.get('http://localhost:4000/datasets');
        setDatasets(response.data.datasets);  // Assuming datasets is an array
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

  // Update chart data when x and y variables are selected
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
    <div>
      <h2>Select a Dataset and Variables to Plot</h2>

      {/* Dataset Dropdown */}
      {datasets && datasets.length > 0 ? (
        <select onChange={handleDatasetSelect}>
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

      {/* Error Display */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Variables Selection */}
      {variables.length > 0 && (
        <div>
          <h3>Select Variables</h3>
          <label>
            X-axis:
            <select onChange={(e) => setSelectedXVariable(e.target.value)} value={selectedXVariable}>
              <option value="">Select X Variable</option>
              {variables.map((variable, index) => (
                <option key={index} value={variable}>
                  {variable}
                </option>
              ))}
            </select>
          </label>

          <label>
            Y-axis:
            <select onChange={(e) => setSelectedYVariable(e.target.value)} value={selectedYVariable}>
              <option value="">Select Y Variable</option>
              {variables.map((variable, index) => (
                <option key={index} value={variable}>
                  {variable}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* Chart Display */}
      {chartData && (
        <div>
          <h3>Chart</h3>
          <Line data={chartData} />
        </div>
      )}
    </div>
  );
};

export default Home;
