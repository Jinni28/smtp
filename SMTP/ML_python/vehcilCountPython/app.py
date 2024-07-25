from flask import Flask, render_template, Response
import cv2
import numpy as np

app = Flask(__name__)
cap = cv2.VideoCapture('video.mp4')
min_width_react = 80  # min width rectangle
min_height_react = 80  # min height rectangle
count_line_position = 550

algo = cv2.createBackgroundSubtractorMOG2()

def center_handle(x, y, w, h):
    x1 = int(w/2)
    y1 = int(h/2)
    cx = x + x1
    cy = y + y1
    return cx, cy

detect = []
offset = 6  # allowable error between pixels
counter = 0  # Define counter as a global variable

def generate_frames():
    global counter  # Use the global counter variable
    while True:
        ret, frame1 = cap.read()
        if not ret:
            break
        grey = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(grey, (3, 3), 5)
        img_sub = algo.apply(blur)
        dilat = cv2.dilate(img_sub, np.ones((5, 5), np.uint8))
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        dilatada = cv2.morphologyEx(dilat, cv2.MORPH_CLOSE, kernel)
        dilatada = cv2.morphologyEx(dilatada, cv2.MORPH_CLOSE, kernel)
        contours, h = cv2.findContours(dilatada, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

        cv2.line(frame1, (25, count_line_position), (1200, count_line_position), (255, 127, 0), 3)

        for (i, c) in enumerate(contours):
            (x, y, w, h) = cv2.boundingRect(c)
            validate_counter = (w >= min_width_react) and (h >= min_height_react)
            if not validate_counter:
                continue
            cv2.rectangle(frame1, (x, y), (x + w, y + h), (0, 255, 0), 2)
            center = center_handle(x, y, w, h)
            detect.append(center)
            cv2.circle(frame1, center, 4, (0, 0, 255), -1)

        for (x, y) in detect:
            if y < (count_line_position + offset) and y > (count_line_position - offset):
                counter += 1
                if (x, y) in detect:
                    detect.remove((x, y))

        cv2.line(frame1, (25, count_line_position), (1200, count_line_position), (205, 255, 0), 3)
        cv2.putText(frame1, "VEHICLE COUNTER: " + str(counter), (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        ret, buffer = cv2.imencode('.jpg', frame1)
        frame1 = buffer.tobytes()

        yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame1 + b'\r\n')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(debug=True)
