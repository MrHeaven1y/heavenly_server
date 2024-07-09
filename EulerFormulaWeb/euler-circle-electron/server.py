from flask import Flask, render_template
from flask_socketio import SocketIO
import numpy as np

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('theta_update', namespace='/theta')
def handle_theta_update(data):
    try:
        temp_theta_value = float(data.get('tempThetaValue', 0))
        temp_theta_str = f"\\theta = {temp_theta_value:.2f}"
        socketio.emit('theta_update', {'tempThetaValue': temp_theta_str}, namespace='/theta')
    except Exception as e:
        print(f"Error in handle_theta_update: {e}")

@socketio.on('change_values', namespace='/main')
def handle_change_values(data):
    try:
        theta = float(data['theta'])
        radius = float(data['radius']) / 10
        angle = float(data['angle'])

        angle_radians = angle * (np.pi / 180)
        radians = theta * (np.pi / 180)
        real_part = np.cos(radians)
        imag_part = np.sin(radians)

        euler_value = complex(real_part, imag_part)
        complex_number = radius * complex(np.cos(angle_radians), np.sin(angle_radians))
        result = complex_number * euler_value

        euler_value_str = f"(Position) \\cdot e^{{i\\theta}} = {result.real:.2f} + {result.imag:.2f}i"
        theta_str = f"\\theta = {theta:.2f}"

        socketio.emit('update_euler', {
            'euler_value': euler_value_str,
            'theta_str': theta_str,
        }, namespace='/main')
    except Exception as e:
        print(f"Error in handle_change_values: {e}")

if __name__ == '__main__':
    socketio.run(app, debug=True,port=5000)
