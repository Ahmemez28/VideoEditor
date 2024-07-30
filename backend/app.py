from flask import Flask, request, jsonify, send_from_directory
from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip
from flask_cors import CORS
import os
import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS

UPLOAD_FOLDER = 'uploads'
CLIP_FOLDER = 'clips'

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CLIP_FOLDER, exist_ok=True)

@app.route('/api/split', methods=['POST'])
def split_video():
    try:
        file = request.files['file']
        start = float(request.form['start'])
        end = float(request.form['end'])

        print(f"Received file: {file.filename}")
        print(f"Start time: {start}, End time: {end}")

        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S%f")
        input_path = os.path.join(UPLOAD_FOLDER, f"{timestamp}_{file.filename}")
        output_path = os.path.join(CLIP_FOLDER, f"{timestamp}_clip.mp4")

        file.save(input_path)
        print(f"Saved file to: {input_path}")

        ffmpeg_extract_subclip(input_path, start, end, targetname=output_path)
        print(f"Clip saved to: {output_path}")

        os.remove(input_path)
        print(f"Removed original file: {input_path}")

        return jsonify({'message': 'Clip created', 'url': f'http://localhost:3001/clips/{os.path.basename(output_path)}'})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/clips/<filename>')
def get_clip(filename):
    return send_from_directory(CLIP_FOLDER, filename)

if __name__ == '__main__':
    app.run(port=3001, debug=True)
