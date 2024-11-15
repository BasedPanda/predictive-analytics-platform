import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { BarChart2, LineChart as LineChartIcon, ScatterChart as ScatterChartIcon } from 'lucide-react';

export const Visualizations = ({ modelInfo }) => {
  const [activeTab, setActiveTab] = useState('importance');

  // Prepare feature importance data
  const featureImportanceData = Object.entries(modelInfo.feature_importance)
    .map(([feature, importance]) => ({
      feature,
      importance: Number((importance * 100).toFixed(2)),
    }))
    .sort((a, b) => b.importance - a.importance);

  // Prepare actual vs predicted comparison data
  const comparisonData = modelInfo.test_actual.map((actual, index) => ({
    id: index + 1,
    actual: typeof actual === 'number' ? Number(actual.toFixed(4)) : actual,
    predicted: typeof modelInfo.test_predictions[index] === 'number' 
      ? Number(modelInfo.test_predictions[index].toFixed(4)) 
      : modelInfo.test_predictions[index],
  }));

  // Custom tooltip for feature importance
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            Importance: {payload[0].value.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Model Visualizations
          </h2>
          <BarChart2 className="h-6 w-6 text-gray-400" />
        </div>

        {/* Visualization Type Selector */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('importance')}
            className={`flex items-center px-4 py-2 rounded-md ${
              activeTab === 'importance'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            Feature Importance
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center px-4 py-2 rounded-md ${
              activeTab === 'comparison'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <LineChartIcon className="h-4 w-4 mr-2" />
            Actual vs Predicted
          </button>
          <button
            onClick={() => setActiveTab('scatter')}
            className={`flex items-center px-4 py-2 rounded-md ${
              activeTab === 'scatter'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ScatterChartIcon className="h-4 w-4 mr-2" />
            Scatter Plot
          </button>
        </div>

        {/* Feature Importance Chart */}
        {activeTab === 'importance' && (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={featureImportanceData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} unit="%" />
                <YAxis dataKey="feature" type="category" width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="importance"
                  fill="#3B82F6"
                  name="Feature Importance"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Actual vs Predicted Comparison Chart */}
        {activeTab === 'comparison' && (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={comparisonData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" label={{ value: 'Sample Index', position: 'bottom' }} />
                <YAxis label={{ value: 'Value', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#3B82F6"
                  name="Actual"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#10B981"
                  name="Predicted"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Scatter Plot */}
        {activeTab === 'scatter' && (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="actual" 
                  name="Actual"
                  label={{ value: 'Actual Values', position: 'bottom' }}
                />
                <YAxis 
                  dataKey="predicted" 
                  name="Predicted"
                  label={{ value: 'Predicted Values', angle: -90, position: 'insideLeft' }}
                />
                <ZAxis range={[50, 50]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter
                  name="Actual vs Predicted"
                  data={comparisonData}
                  fill="#3B82F6"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Model Performance Metrics */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Model Performance
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Metric</p>
              <p className="text-lg font-medium">
                {modelInfo.metric_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Score</p>
              <p className="text-lg font-medium">
                {modelInfo.score.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualizations;