// src/components/OptionsStrategyAnalyzer.js

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const initialOption = { type: 'call', strikePrice: 100, premium: 5, position: 'long' };

const OptionsStrategyAnalyzer = () => {
  const [options, setOptions] = useState([initialOption]);
  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    calculateStrategy();
  }, [options]);

  const addOption = () => {
    setOptions([...options, initialOption]);
  };

  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleInputChange = (index, field, value) => {
    const newOptions = options.map((option, i) => (i === index ? { ...option, [field]: value } : option));
    setOptions(newOptions);
  };

  const calculateStrategy = () => {
    const underlyingPrices = [];
    const profits = [];

    for (let price = 0; price <= 200; price += 1) {
      underlyingPrices.push(price);
      let profit = 0;

      options.forEach((option) => {
        const { type, strikePrice, premium, position } = option;
        const isCall = type === 'call';
        const isLong = position === 'long';

        let optionProfit;
        if (isCall) {
          optionProfit = Math.max(price - strikePrice, 0) - premium;
        } else {
          optionProfit = Math.max(strikePrice - price, 0) - premium;
        }

        profit += isLong ? optionProfit : -optionProfit;
      });

      profits.push(profit);
    }

    const maxProfit = Math.max(...profits);
    const maxLoss = Math.min(...profits);
    const breakEvenPoints = underlyingPrices.filter((price, index) => profits[index] === 0);

    setResult({ maxProfit, maxLoss, breakEvenPoints });

    setChartData({
      labels: underlyingPrices,
      datasets: [
        {
          label: 'Profit/Loss',
          backgroundColor: 'rgba(255, 178, 50, 0.2)',
          borderColor: 'rgba(255, 178, 50, 1)',
          data: profits,
          fill: false,
          tension: 0.4,
        },
      ],
    });
  };

  return (
    <div className="options-strategy-analyzer">
      <h1>Risk & Reward</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          calculateStrategy();
        }}
      >
        {options.map((option, index) => (
          <div key={index} className="option-input">
            <label>Option {index + 1}</label>
            <select value={option.type} onChange={(e) => handleInputChange(index, 'type', e.target.value)}>
              <option value="call">Call</option>
              <option value="put">Put</option>
            </select>
            <input
              type="number"
              value={option.strikePrice}
              onChange={(e) => handleInputChange(index, 'strikePrice', e.target.value)}
              placeholder="Strike Price"
              required
            />
            <input
              type="number"
              value={option.premium}
              onChange={(e) => handleInputChange(index, 'premium', e.target.value)}
              placeholder="Premium"
              required
            />
            <select value={option.position} onChange={(e) => handleInputChange(index, 'position', e.target.value)}>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
            <button type="button" onClick={() => removeOption(index)} disabled={options.length === 1}>
              Remove
            </button>
          </div>
        ))}
        <div className="form-buttons">
          <button type="button" onClick={addOption} disabled={options.length >= 4}>
            Add Option
          </button>
       
        </div>
      </form>

      {result && (
        <div className="results">
          <h2>Results</h2>
          <p><strong>Max Profit:</strong> {result.maxProfit}</p>
          <p><strong>Max Loss:</strong> {result.maxLoss}</p>
          <p><strong>Break Even Points:</strong> {result.breakEvenPoints.join(', ')}</p>
          <div className="line-chart">
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionsStrategyAnalyzer;
