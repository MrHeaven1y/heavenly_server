from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.preprocessing import MinMaxScaler
import pandas as pd
import json
import numpy as np
import pickle
_model=None
_locations=None
_scaler = None
_encoder= None
def load_artifacts():
        print("loading saving artifacts...start")
        global _model
        global _locations
        global _scaler
        global _encoder
        if _model is None:
            with open("model.pkl", "rb") as f:
                _model = pickle.load(f)
        with open("columns.json") as f:
            _locations = json.load(f)['data_columns']
        with open('encoder.pkl', 'rb') as f:
            _encoder = pickle.load(f)
        with open("scaler.pkl", "rb") as f:
            _scaler = pickle.load(f)
        with open('encoder.pkl', 'rb') as f:
             _encoder = pickle.load(f)
        with open('scaler.pkl','rb') as f:
             _scaler = pickle.load(f)

def predict(bath,balcony,total_sqft,location,avail,size):
        df = {'location': location,
            'balcony':balcony,
            'total_sqft':total_sqft,
            'avail': avail,
            'size':size,
            'bath': bath
        }
        df = pd.DataFrame(df)
        df.bath.fillna(-1,inplace=True)
        df.balcony.fillna(-1,inplace=True)
        categorical_cols = ['location', 'avail', 'size']
        numerical_cols = ['total_sqft', 'balcony', 'bath']
        df[categorical_cols] = df[categorical_cols].astype('category')
        df[categorical_cols] = df[numerical_cols].apply(pd.to_numeric, errors='coerce')
        pred = _model.predict(df)
if __name__ == '__main__':
    load_artifacts()
    print()