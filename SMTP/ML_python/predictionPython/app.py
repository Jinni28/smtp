from flask import Flask, render_template, request
import numpy as np
from sklearn.linear_model import LinearRegression

app = Flask(__name__)

# Example data
num_objects = np.array([5,10,15, 20,25, 30,35, 40,45, 50]).reshape(-1, 1)
green_light_time = np.array([20,30,35, 40,45, 50,55, 60,65, 70])

# Create and train the linear regression model
model = LinearRegression()
model.fit(num_objects, green_light_time)

@app.route('/', methods=['GET', 'POST'])
def index():
    predicted_time = None
    if request.method == 'POST':
        num_objects_to_predict = np.array([[int(request.form['num_objects'])]])
        predicted_time = model.predict(num_objects_to_predict)[0]
    return render_template('index.html', predicted_time=predicted_time)

if __name__ == '__main__':
    app.run(debug=True)
