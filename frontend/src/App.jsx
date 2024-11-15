import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { ModelTraining } from './components/ModelTraining';
import { Predictions } from './components/Predictions';
import { Visualizations } from './components/Visualizations';
import { useToast } from "@/components/ui/use-toast";
import {
  BookOpen,
  UploadCloud,
  Brain,
  BarChart2,
  LineChart,
  Settings,
  Github,
} from 'lucide-react';

const App = () => {
  // State management
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const { toast } = useToast();

  // Navigation items configuration
  const navigationItems = [
    {
      id: 'upload',
      name: 'Upload Data',
      icon: UploadCloud,
      disabled: false,
    },
    {
      id: 'train',
      name: 'Train Model',
      icon: Brain,
      disabled: !uploadedFile,
    },
    {
      id: 'predict',
      name: 'Make Predictions',
      icon: BarChart2,
      disabled: !modelInfo,
    },
    {
      id: 'visualize',
      name: 'Visualizations',
      icon: LineChart,
      disabled: !modelInfo,
    },
  ];

  // Handle file upload success
  const handleUploadSuccess = useCallback((data) => {
    setUploadedFile(data);
    setModelInfo(null); // Reset model info when new file is uploaded
    setActiveTab('train');
    toast({
      title: "File Uploaded Successfully",
      description: `Loaded dataset with ${data.shape[0]} rows and ${data.shape[1]} columns.`,
    });
  }, [toast]);

  // Handle model training success
  const handleTrainingSuccess = useCallback((data) => {
    setModelInfo(data);
    setActiveTab('predict');
    toast({
      title: "Model Trained Successfully",
      description: `${data.metric_name}: ${data.score.toFixed(4)}`,
    });
  }, [toast]);

  // Reset application state
  const handleReset = useCallback(() => {
    setUploadedFile(null);
    setModelInfo(null);
    setActiveTab('upload');
    toast({
      title: "Application Reset",
      description: "All data and model information has been cleared.",
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">
                Predictive Analytics Platform
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/yourusername/predictive-analytics-platform"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700"
              >
                <Github className="h-6 w-6" />
              </a>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-4" aria-label="Tabs">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => !item.disabled && setActiveTab(item.id)}
                disabled={item.disabled}
                className={`
                  flex items-center px-3 py-2 rounded-md text-sm font-medium
                  ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : item.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                <item.icon className="h-5 w-5 mr-2" />
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            {/* Step Indicator */}
            <div className="mb-6">
              <div className="flex items-center">
                {navigationItems.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <div
                      className={`flex items-center ${
                        item.disabled ? 'opacity-50' : ''
                      }`}
                    >
                      <div
                        className={`
                          flex items-center justify-center w-8 h-8 rounded-full
                          ${
                            activeTab === item.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }
                        `}
                      >
                        {index + 1}
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {item.name}
                      </span>
                    </div>
                    {index < navigationItems.length - 1 && (
                      <div className="flex-1 mx-4 h-0.5 bg-gray-200" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Component Rendering */}
            {activeTab === 'upload' && (
              <FileUpload onUploadSuccess={handleUploadSuccess} />
            )}
            {activeTab === 'train' && uploadedFile && (
              <ModelTraining
                columns={uploadedFile.columns}
                filename={uploadedFile.filename}
                onTrainingSuccess={handleTrainingSuccess}
              />
            )}
            {activeTab === 'predict' && modelInfo && (
              <Predictions modelInfo={modelInfo} />
            )}
            {activeTab === 'visualize' && modelInfo && (
              <Visualizations modelInfo={modelInfo} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Built with React, Flask, and scikit-learn
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="#documentation"
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <BookOpen className="h-4 w-4 mr-1" />
                Documentation
              </a>
              <a
                href="#settings"
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
