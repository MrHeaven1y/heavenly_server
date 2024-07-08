from flask import Flask, render_template
from flask_socketio import SocketIO
import numpy as np

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('update_values')
def handle_update_values(data):
    try:
        theta = float(data['theta'])
        radius = float(data['radius']) / 10
        angle = float(data['angle'])
        temp_theta = data.get('tempTheta')

        angle_radians = angle * (np.pi / 180)
        radians = theta * (np.pi / 180)
        real_part = np.cos(radians)
        imag_part = np.sin(radians)

        euler_value = complex(real_part, imag_part)
        complex_number = radius * complex(np.cos(angle_radians), np.sin(angle_radians))
        result = complex_number * euler_value

        euler_value_str = f"(Position) \\cdot e^{{i\\theta}} = {result.real:.2f} + {result.imag:.2f}i"
        theta_str = f"\\theta = {theta:.2f}"

        response_data = {
            'euler_value': euler_value_str,
            'theta_str': theta_str,
        }

        if temp_theta is not None:
            temp_theta_value = float(temp_theta)
            temp_theta_str = f"\\theta = {temp_theta_value:.2f}"
            response_data['temp_theta_str'] = temp_theta_str
            response_data['temp_theta_value'] = temp_theta_value

        socketio.emit('update_euler', response_data)
    except Exception as e:
        print(f"Error in handle_update_values: {e}")
        print(f"Received data: {data}")  # Add this line for debugging
if __name__ == '__main__':
    socketio.run(app, debug=True,allow_unsafe_werkzeug=True)