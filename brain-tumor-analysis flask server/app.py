from flask import Flask, render_template, request, jsonify
from prediction import predict
import os
import numpy as np
import base64
import traceback

app = Flask(__name__)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

class_dictionary = {
    0:'no',
    1:'yes'
}
size = (224,224)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/classify_image', methods=['POST'])
def classify_image():
    try:
        if 'image_data' not in request.form:
            print("No image data received")
            return jsonify({'error': 'No image data'})
        
        image_data = request.form['image_data']
        image_data = image_data.split(',')[1]  
        image_binary = base64.b64decode(image_data)
        
        # Save the image file
        filename = 'uploaded_image.png'
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        with open(file_path, 'wb') as f:
            f.write(image_binary)
        
        # Predict
        prediction = predict(file_path, size=size, image_type='rgb')
        
        # Print out detailed prediction information
        print("Raw Prediction:", prediction)
        print("Prediction Shape:", prediction.shape)
        
        # Ensure prediction is correctly formatted
        if prediction.ndim > 1:
            prediction = prediction[0]
        
        # Convert to list and ensure float type
        prediction_list = [float(p) for p in prediction]
        
        # Get the class with highest probability
        max_index = int(np.argmax(prediction))
        predicted_class = class_dictionary[max_index]
        
        # Create result dictionary
        mock_result = [
            {
                "class": predicted_class,
                "class_probability": prediction_list,
                "class_dictionary": {'no':0, 'yes':1}
            }
        ]
        
        print("Final Result:", mock_result)
        
        return jsonify(mock_result)
    
    except Exception as e:
        print("Error in classification:")
        print(traceback.format_exc())
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)