import cv2
import time
import os
import numpy as np
from flask import Flask, Response, send_file
import datetime

app = Flask(__name__)

# Ensure a directory for saving detected motion images
if not os.path.exists('detected_face_motion'):
    os.makedirs('detected_face_motion')

# Load face cascade
face_classifier = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

video_capture = cv2.VideoCapture(0)

# Background subtractor with adjusted parameters
back_sub = cv2.createBackgroundSubtractorMOG2(history=100, varThreshold=50, detectShadows=False)
kernel = np.ones((7,7), np.uint8)

# Variables for motion and face detection
motion_detected = False
face_detected = False
last_capture_time = 0
capture_cooldown = 5  # seconds between captures

def detect_faces(frame):
    """Detect faces in the frame and return face bounding boxes."""
    gray_image = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_classifier.detectMultiScale(
        gray_image,
        scaleFactor=1.2,
        minNeighbors=10,
        minSize=(150, 150)
    )
    return faces

def detect_motion(frame, prev_frame):
    """Detect motion between two frames."""
    if prev_frame is None:
        return False
    
    frame_delta = cv2.absdiff(prev_frame, frame)
    thresh = cv2.threshold(frame_delta, 25, 255, cv2.THRESH_BINARY)[1]
    thresh = cv2.dilate(thresh, None, iterations=2)
    contours, _ = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    for contour in contours:
        if cv2.contourArea(contour) > 500:
            return True
    return False

def add_timestamp_overlay(frame):
    """Add timestamp to the bottom right corner of the frame."""
    # Get current timestamp
    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Define position and styling
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.7
    font_color = (255, 255, 255)  # White
    font_thickness = 2
    
    # Get text size to calculate background box
    (text_width, text_height), _ = cv2.getTextSize(current_time, font, font_scale, font_thickness)
    
    # Define box parameters
    padding = 10
    box_color = (0, 0, 0)  # Black
    box_opacity = 0.5
    
    # Calculate positions
    frame_height, frame_width = frame.shape[:2]
    box_x1 = frame_width - text_width - 3*padding
    box_x2 = frame_width - padding
    box_y1 = frame_height - text_height - 3*padding
    box_y2 = frame_height - padding
    
    # Create semi-transparent overlay
    overlay = frame.copy()
    cv2.rectangle(overlay, (box_x1, box_y1), (box_x2, box_y2), box_color, -1)
    
    # Blend overlay with original frame
    frame_with_timestamp = cv2.addWeighted(overlay, box_opacity, frame, 1 - box_opacity, 0)
    
    # Add text
    cv2.putText(frame_with_timestamp, 
                current_time, 
                (box_x1 + padding, box_y2 - padding), 
                font, 
                font_scale, 
                font_color, 
                font_thickness)
    
    return frame_with_timestamp

def process_frame(frame, prev_frame):
    global motion_detected, face_detected, last_capture_time
    
    frameG = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    frameG_eq = cv2.equalizeHist(frameG)
    
    # Detect motion
    current_time = time.time()
    is_motion = detect_motion(frameG, prev_frame)
    
    # Detect faces
    faces = detect_faces(frame)
    
    # Update detection states
    motion_detected = is_motion
    face_detected = len(faces) > 0
    
    # Capture image if both motion and face are detected, with cooldown
    if motion_detected and face_detected:
        if current_time - last_capture_time > capture_cooldown:
            filename = f'detected_face_motion/face_motion_{int(current_time)}.png'
            cv2.imwrite(filename, frame)
            print(f"Face and Motion detected! Image saved: {filename}")
            last_capture_time = current_time
    
    # Apply background subtraction
    fg_mask = back_sub.apply(frameG_eq)
    fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_OPEN, kernel)
    fg_mask = cv2.dilate(fg_mask, kernel, iterations=10)
    
    # Threshold the fg_mask
    _, thresh = cv2.threshold(fg_mask, 200, 255, cv2.THRESH_BINARY)

    # Find contours of objects detected by background subtractor
    contours, _ = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

    # Draw rectangles for motion and faces
    for contour in contours:
        area = cv2.contourArea(contour)
        if area > 20000:
            x, y, w, h = cv2.boundingRect(contour)
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 3)

    for (x, y, w, h) in faces:
        cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)

    # Add text overlay for detection status
    status_text = f"Motion: {motion_detected}, Faces: {face_detected}"
    cv2.putText(frame, status_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, 
                (0, 0, 255) if (motion_detected and face_detected) else (0, 255, 0), 2)
    
    # Add timestamp overlay
    frame_with_timestamp = add_timestamp_overlay(frame)
    
    return frame_with_timestamp, frameG

prev_frame = None

def generate_frames():
    global prev_frame
    while True:
        success, frame = video_capture.read()
        if not success:
            break
        else:
            frame, gray_frame = process_frame(frame, prev_frame)
            prev_frame = gray_frame
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/')
def index():
    return """
    <html>
      <body>
        <h1>Face and Motion Detection Video Stream</h1>
        <img src="/video_feed" width="640" height="480" />
      </body>
    </html>
    """

@app.route('/latest_image')
def latest_image():
    image_dir = 'detected_face_motion'
    images = [os.path.join(image_dir, f) for f in os.listdir(image_dir) if f.endswith('.png')]
    if images:
        latest_image = max(images, key=os.path.getctime)
        return send_file(latest_image, mimetype='image/png')
    else:
        return "No images found", 404
    

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)

print("Server running on http://localhost:5000")