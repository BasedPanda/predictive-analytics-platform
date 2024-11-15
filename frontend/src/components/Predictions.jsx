import React, { useState } from 'react';
import { AlertCircle, ArrowRight, BarChart2, Info } from 'lucide-react';
import axios from 'axios';

export const Predictions = ({ modelInfo }) => {
  const [inputData, setInputData] = useState({});
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (feature, value) => {
    setInputData((prev) => ({
      ...prev,
      [feature]: isNaN(value) ? value : Number(value),
    }));
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/predict', {
        data: [inputData],
      });

      setPredictions(response.data.predictions);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to make prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInputData({});
    setPredictions(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Make Predictions
          </h2>
          <BarChart2 className="h-6 w-6 text-gray-400" />
        </div>

        <div className="space-y-6">
          {/* Feature Importance Summary */}
          <div className="bg-blue-50 rounded-md p-4 mb-6">
            <div className="flex">
              <Info className="h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Model Performance
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  {modelInfo.metric_name}: {modelInfo.score.toFixed(4)}
                </p>
              </div>
            </div>
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(modelInfo.feature_importance)
              .sort(([, a], [, b]) => b - a) // Sort by importance
              .map(([feature, importance]) => (
                <div key={feature} className="space-y-1">
                  <label
                    htmlFor={feature}
                    className="block text-sm font-medium text-gray-700"
                  >
                    {feature}
                    <span className="text-xs text-gray-500 ml-2">
                      (Importance: {(importance * 100).toFixed(1)}%)
                    </span>
                  </label>
                  <input
                    type="text"
                    id={feature}
                    value={inputData[feature] || ''}
                    onChange={(e) => handleInputChange(feature, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter value"
                  />
                </div>
              ))}
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handlePredict}
              disabled={loading}
              className={`
                flex-1 flex items-center justify-center py-2 px-4 border border-transparent 
                rounded-md shadow-sm text-sm font-medium text-white
                ${
                  loading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }
              `}
            >
              {loading ? (
                'Making Prediction...'
              ) : (
                <>
                  Make Prediction
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset
            </button>
          </div>

          {/* Prediction Results */}
          {predictions && (
            <div className="mt-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-green-900 mb-4">
                  Prediction Results
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">
                      Predicted Value:
                    </span>
                    <span className="text-2xl font-bold text-green-900">
                      {typeof predictions[0] === 'number'
                        ? predictions[0].toFixed(4)
                        : predictions[0]}
                    </span>
                  </div>
                  
                  {modelInfo.problem_type === 'classification' && (
                    <p className="text-sm text-green-700">
                      This is a classification prediction representing the most likely class.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Predictions;