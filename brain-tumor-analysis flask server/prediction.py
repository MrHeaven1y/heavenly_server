import tensorflow as tf
from PIL import Image
import numpy as np

class Grayscale(tf.keras.layers.Layer):
    def __init__(self,**kwargs):
        super(Grayscale,self).__init__(**kwargs)
    def call(self,inputs):
        return tf.image.rgb_to_grayscale(inputs)
    def get_config(self):
        config = super(Grayscale,self).get_config()
        return config


model = tf.keras.models.load_model('./artifacts/model.keras',custom_objects={'Grayscale':Grayscale})

tf.compat.v1.logging.set_verbosity(tf.compat.v1.logging.ERROR)
def predict(file, size, image_type='grayscale'):

    img = Image.open(file)
    img = img.resize(size)
    
    img = img.convert('RGB') if image_type == 'rgb' else img.convert('L')
    img = np.array(img)
    
    img = np.expand_dims(img, axis=0)
    img = img / 255.0

    prediction = model.predict(img)
   
    
    return prediction
    