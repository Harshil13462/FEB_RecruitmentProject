from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import os
import pandas as pd
from werkzeug.utils import secure_filename

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Configurations
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Function to check file extension
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Route to handle file uploads
@app.route('/upload', methods=['POST'])
def upload_file():
    # Check if a file is present in the request
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    # Check if the file is valid
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        # Secure the filename and save it to the uploads folder
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Read CSV with pandas
        try:
            df = pd.read_csv(filepath)
        except Exception as e:
            return jsonify({'error': f'Failed to process CSV file: {str(e)}'}), 400

        # Optionally, process the data here (example: get summary stats)
        summary = df.describe().to_dict()

        # Return the summary or processed data as a JSON response
        return jsonify({'filename': filename, 'summary': summary}), 200

    return jsonify({'error': 'File type not allowed'}), 400

# Route to get processed data (you can extend this as needed)
@app.route('/data/<filename>', methods=['GET'])
def get_data(filename):
    # Check if file exists in the upload folder
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404

    # Load the CSV again (or store results in memory or a database)
    try:
        df = pd.read_csv(filepath)
        data = df.to_dict(orient='records')  # Convert the DataFrame to a list of dictionaries
    except Exception as e:
        return jsonify({'error': f'Failed to load data: {str(e)}'}), 500

    return jsonify({'filename': filename, 'data': data}), 200

# Route to list all available datasets
@app.route('/datasets', methods=['GET'])
def list_datasets():
    try:
        files = [f for f in os.listdir(app.config['UPLOAD_FOLDER']) if allowed_file(f)]
        return jsonify({'datasets': files}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to list files: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=4000)