import React, { useState } from 'react';
import { AlertCircle, BarChart2, Settings2 } from 'lucide-react';
import axios from 'axios';

export const ModelTraining = ({ columns, filename, onTrainingSuccess }) => {
  const [targetColumn, setTargetColumn] = useState('');
  const [problemType, setProblemType] = useState('regression');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/train', {
        filename,
        targetColumn,
        problemType,
      });

      onTrainingSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to train model');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Model Configuration
          </h2>
          <Settings2 className="h-6 w-6 text-gray-400" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="targetColumn"
              className="block text-sm font-medium text-gray-700"
            >
              Target Column
            </label>
            <select
              id="targetColumn"
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select target variable</option>
              {columns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Choose the column you want to predict
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Problem Type
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProblemType('regression')}
                className={`
                  flex items-center justify-center px-4 py-2 border rounded-md
                  ${
                    problemType === 'regression'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700'
                  }
                `}
              >
                <BarChart2 className="h-5 w-5 mr-2" />
                Regression
              </button>
              <button
                type="button"
                onClick={() => setProblemType('classification')}
                className={`
                  flex items-center justify-center px-4 py-2 border rounded-md
                  ${
                    problemType === 'classification'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700'
                  }
                `}
              >
                <Settings2 className="h-5 w-5 mr-2" />
                Classification
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Select whether your target variable is continuous (regression) or
              categorical (classification)
            </p>
          </div>

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

          <button
            type="submit"
            disabled={loading || !targetColumn}
            className={`
              w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
              ${
                loading || !targetColumn
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }
            `}
          >
            {loading ? 'Training Model...' : 'Train Model'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModelTraining;