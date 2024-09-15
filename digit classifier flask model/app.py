from flask import Flask, request, jsonify, render_template
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
import os

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

classifier = load_model('digit_recong.keras')

CLASS_LABELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

@app.route('/')
def index():
    return render_template('index.html')

def process_image(image, target_size=(28, 28)):
    """
    Preprocess the image by resizing it to the target size and normalizing.
    """
    img = Image.open(image)
    resize_img = img.resize(target_size)
    resize_image = resize_img.convert('L')
    image_array = np.array(resize_image)
    
    flatten_array = image_array.flatten()
    flatten_array = flatten_array.reshape(1, target_size[0] * target_size[1])
    
    return flatten_array

def predict_image(image, model):
    """
    Pass the preprocessed image to the model for prediction.
    """
    processed_image = process_image(image)
    prediction = model.predict(processed_image)
    
    return prediction

@app.route('/classify', methods=['POST'])
def classify_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        predictions = predict_image(image=file, model=classifier)
        
        # Get the index of the highest probability
        predicted_class = np.argmax(predictions)
        
        # Create a dictionary of class probabilities
        results = {str(class_label): float(prob) for class_label, prob in zip(CLASS_LABELS, predictions[0])}
        
        # Add the predicted class to the results
        results['predicted_class'] = int(predicted_class)

        return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)