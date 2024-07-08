from flask import Flask, render_template, request, jsonify,url_for
import util 
app = Flask(__name__)

@app.route('/index', methods=['POST','GET'])
def get_data():
    if request.form == 'POST':
        avail =request.form['avail']
        location =request.form['location']
        size =request.form['size']
        society =request.form['society']
        total_sqft = float(request.form['total_sqft'])
        bath = int(request.form['bath'])
        balcony =int(request.form['balcony'])
        return avail,location,size,society,total_sqft,bath,balcony
    else:
        avail =request.args.get['avail']
        location =request.args.get['location']
        size =request.args.get['size']
        society =request.args.get['society']
        total_sqft = float(request.args.get['total_sqft'])
        bath = int(request.args.get['bath'])
        balcony =int(request.args.get['balcony'])
        return avail,location,size,society,total_sqft,bath,balcony

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)