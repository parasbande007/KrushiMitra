from flask import Flask, render_template, request
import joblib
import numpy as np
import pandas as pd

# Initialize the Flask application
app = Flask(__name__)

# Load the trained models and label encoder
model_production = joblib.load('svm_model_production.pkl')
model_crop = joblib.load('svm_model_crop.pkl')
label_encoder_crop = joblib.load('label_encoder_crop.pkl')

# Define a route for the home page
@app.route('/')
def home():
    return render_template('index.html')

# Define a route for prediction
@app.route('/predict', methods=['POST'])
def predict():
    # Get input values from the form
    State_Name = request.form['State_Name']
    District_Name = request.form['District_Name']
    Season = request.form['Season']
    Area = float(request.form['Area'])
    
    # Create a DataFrame for the input values
    input_features = pd.DataFrame({
        'State_Name': [State_Name],
        'District_Name': [District_Name],
        'Season': [Season],
        'Area': [Area]
    })
    
    # Predict using the loaded models
    production_predicted = model_production.predict(input_features)[0]
    
    try:
        crop_encoded_predicted = model_crop.predict(input_features)[0]
        crop_predicted = label_encoder_crop.inverse_transform([crop_encoded_predicted])[0]
    except ValueError as e:
        crop_predicted = 'Unknown'
        print(f"Error: {e}")
    
    # Format the prediction result
    result = f"Predicted Crop: {crop_predicted}, Predicted Production: {production_predicted}"
    
    # Render the template with prediction result
    return render_template('index.html', prediction=result)

if __name__ == '__main__':
    app.run(debug=True)
