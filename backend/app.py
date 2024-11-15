from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_squared_error, accuracy_score, r2_score, classification_report
import joblib
import os
from werkzeug.utils import secure_filename
import logging
from datetime import datetime
import json

# Configure logging
logging.basicConfig(level=logging.INFO,
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
MODELS_FOLDER = 'models'
ALLOWED_EXTENSIONS = {'csv'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Ensure required directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(MODELS_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if the file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class PredictiveModel:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.feature_columns = None
        self.target_column = None
        self.problem_type = None
        self.categorical_columns = []
        self.numerical_columns = []
        
    def _identify_column_types(self, df):
        """Identify numerical and categorical columns in the dataset."""
        self.numerical_columns = df.select_dtypes(include=['int64', 'float64']).columns.tolist()
        self.categorical_columns = df.select_dtypes(include=['object', 'category']).columns.tolist()
        
    def _preprocess_data(self, df, is_training=True):
        """Preprocess the data including handling categorical variables and scaling."""
        # Create a copy to avoid modifying the original dataframe
        processed_df = df.copy()
        
        # Handle categorical columns
        for col in self.categorical_columns:
            if col in processed_df.columns:
                if is_training:
                    processed_df[col] = self.label_encoder.fit_transform(processed_df[col].astype(str))
                else:
                    processed_df[col] = self.label_encoder.transform(processed_df[col].astype(str))
        
        # Scale numerical features
        if self.numerical_columns:
            if is_training:
                processed_df[self.numerical_columns] = self.scaler.fit_transform(processed_df[self.numerical_columns])
            else:
                processed_df[self.numerical_columns] = self.scaler.transform(processed_df[self.numerical_columns])
        
        return processed_df
        
    def train(self, X, y, problem_type='regression'):
        """Train the model with the given data."""
        self.problem_type = problem_type
        self.feature_columns = X.columns.tolist()
        self.target_column = y.name
        
        # Identify column types
        self._identify_column_types(X)
        
        # Preprocess features
        X_processed = self._preprocess_data(X, is_training=True)
        
        # Handle target variable for classification
        if problem_type == 'classification':
            y = self.label_encoder.fit_transform(y.astype(str))
            self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        else:
            self.model = RandomForestRegressor(n_estimators=100, random_state=42)
            
        # Train the model
        self.model.fit(X_processed, y)
        
        # Save model metadata
        self.save_metadata()
        
    def predict(self, X):
        """Make predictions on new data."""
        X_processed = self._preprocess_data(X, is_training=False)
        predictions = self.model.predict(X_processed)
        
        # Inverse transform for classification predictions
        if self.problem_type == 'classification':
            predictions = self.label_encoder.inverse_transform(predictions)
            
        return predictions
    
    def get_feature_importance(self):
        """Get feature importance scores."""
        return dict(zip(self.feature_columns, self.model.feature_importances_))
    
    def save_metadata(self):
        """Save model metadata for future reference."""
        metadata = {
            'feature_columns': self.feature_columns,
            'target_column': self.target_column,
            'problem_type': self.problem_type,
            'categorical_columns': self.categorical_columns,
            'numerical_columns': self.numerical_columns,
            'timestamp': datetime.now().isoformat()
        }
        
        with open(os.path.join(MODELS_FOLDER, 'model_metadata.json'), 'w') as f:
            json.dump(metadata, f)

# Initialize the model
model = PredictiveModel()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint to check if the API is running."""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file upload and initial data processing."""
    try:
        # Check if file is present in request
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            # Secure the filename and save the file
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Read and analyze the dataset
            df = pd.read_csv(filepath)
            
            # Get basic dataset statistics
            stats = {
                'columns': df.columns.tolist(),
                'shape': df.shape,
                'preview': df.head().to_dict('records'),
                'dtypes': df.dtypes.astype(str).to_dict(),
                'missing_values': df.isnull().sum().to_dict()
            }
            
            return jsonify({
                'message': 'File uploaded successfully',
                'filename': filename,
                'statistics': stats
            })
            
        return jsonify({'error': 'Invalid file type'}), 400
        
    except Exception as e:
        logger.error(f"Error in upload_file: {str(e)}")
        return jsonify({'error': 'Internal server error during file upload'}), 500

@app.route('/api/train', methods=['POST'])
def train_model():
    """Train the model with the specified configuration."""
    try:
        data = request.json
        filename = secure_filename(data['filename'])
        target_column = data['targetColumn']
        problem_type = data['problemType']
        
        # Load the dataset
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        df = pd.read_csv(filepath)
        
        # Split features and target
        X = df.drop(columns=[target_column])
        y = df[target_column]
        
        # Split data into train and test sets
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train the model
        model.train(X_train, y_train, problem_type)
        
        # Make predictions on test set
        y_pred = model.predict(X_test)
        
        # Calculate metrics
        metrics = {}
        if problem_type == 'regression':
            metrics = {
                'rmse': float(mean_squared_error(y_test, y_pred, squared=False)),
                'r2': float(r2_score(y_test, y_pred))
            }
        else:
            metrics = {
                'accuracy': float(accuracy_score(y_test, y_pred)),
                'classification_report': classification_report(y_test, y_pred, output_dict=True)
            }
        
        # Get feature importance
        feature_importance = model.get_feature_importance()
        
        # Save the trained model
        joblib.dump(model, os.path.join(MODELS_FOLDER, 'trained_model.joblib'))
        
        return jsonify({
            'success': True,
            'metrics': metrics,
            'feature_importance': feature_importance,
            'test_predictions': y_pred[:5].tolist(),
            'test_actual': y_test[:5].tolist()
        })
        
    except Exception as e:
        logger.error(f"Error in train_model: {str(e)}")
        return jsonify({'error': f'Error during model training: {str(e)}'}), 500

@app.route('/api/predict', methods=['POST'])
def predict():
    """Make predictions on new data."""
    try:
        input_data = request.json['data']
        df = pd.DataFrame(input_data)
        
        # Ensure all required features are present
        missing_features = set(model.feature_columns) - set(df.columns)
        if missing_features:
            return jsonify({
                'error': f'Missing features: {list(missing_features)}'
            }), 400
        
        # Reorder columns to match training data
        df = df[model.feature_columns]
        
        # Make predictions
        predictions = model.predict(df)
        
        return jsonify({
            'predictions': predictions.tolist(),
            'feature_importance': model.get_feature_importance()
        })
        
    except Exception as e:
        logger.error(f"Error in predict: {str(e)}")
        return jsonify({'error': f'Error during prediction: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
