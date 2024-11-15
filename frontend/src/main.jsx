import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Toaster } from '@/components/ui/toaster';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to your preferred error tracking service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We're sorry, but something went wrong. Please try refreshing the page or contact support if the problem persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 p-4 bg-gray-50 rounded-md">
                <summary className="text-sm text-gray-700 cursor-pointer">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-red-600 overflow-auto">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Performance Monitoring
const reportWebVitals = (metric) => {
  // Implement your preferred analytics service here
  console.log(metric);
};

// Feature Detection
const checkBrowserSupport = () => {
  const requiredFeatures = {
    flexbox: () => CSS.supports('display', 'flex'),
    grid: () => CSS.supports('display', 'grid'),
    fetch: () => typeof fetch === 'function',
    customProperties: () => CSS.supports('color', 'var(--color)'),
  };

  const unsupportedFeatures = Object.entries(requiredFeatures)
    .filter(([, test]) => !test())
    .map(([feature]) => feature);

  return unsupportedFeatures.length === 0;
};

// Initialize App
const initializeApp = () => {
  // Check for browser support
  if (!checkBrowserSupport()) {
    document.getElementById('root').innerHTML = `
      <div class="p-4 text-center">
        <h2 class="text-xl font-bold mb-2">Unsupported Browser</h2>
        <p>Please use a modern browser to access this application.</p>
      </div>
    `;
    return;
  }

  // Create root and render app
  const root = ReactDOM.createRoot(document.getElementById('root'));
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <div className="min-h-screen bg-background">
          <App />
          <Toaster />
        </div>
      </ErrorBoundary>
    </React.StrictMode>
  );

  // Report web vitals
  reportWebVitals();
};

// Handle loading states
const showLoading = () => {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.display = 'block';
  }
};

const hideLoading = () => {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.display = 'none';
  }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  showLoading();
  
  // Simulate checking for any required resources or configurations
  Promise.all([
    // Add any initialization promises here
    import('./App').catch(console.error),
  ])
    .then(() => {
      hideLoading();
      initializeApp();
    })
    .catch((error) => {
      console.error('Failed to initialize app:', error);
      hideLoading();
      document.getElementById('root').innerHTML = `
        <div class="p-4 text-center">
          <h2 class="text-xl font-bold mb-2">Failed to Load Application</h2>
          <p>Please refresh the page or try again later.</p>
        </div>
      `;
    });
});

// Hot Module Replacement (HMR)
if (import.meta.hot) {
  import.meta.hot.accept();
}