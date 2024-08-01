from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip
import os
import datetime

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///clips.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

UPLOAD_FOLDER = 'uploads'
CLIP_FOLDER = 'clips'

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CLIP_FOLDER, exist_ok=True)

class Clip(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    original_filename = db.Column(db.String(200), nullable=False)
    start = db.Column(db.Float, nullable=False)
    end = db.Column(db.Float, nullable=False)
    clip_filename = db.Column(db.String(200), nullable=False)

with app.app_context():
    db.create_all()

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

        clip = Clip(
            original_filename=file.filename,
            start=start,
            end=end,
            clip_filename=os.path.basename(output_path)
        )
        db.session.add(clip)
        db.session.commit()

        return jsonify({'message': 'Clip created', 'url': f'http://localhost:3001/clips/{clip.clip_filename}'})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/clips/<filename>')
def get_clip(filename):
    return send_from_directory(CLIP_FOLDER, filename)

@app.route('/api/clips', methods=['GET'])
def get_clips():
    clips = Clip.query.all()
    result = {}
    for clip in clips:
        if clip.original_filename not in result:
            result[clip.original_filename] = []
        result[clip.original_filename].append({
            'id': clip.id,
            'start': clip.start,
            'end': clip.end,
            'url': f'http://localhost:3001/clips/{clip.clip_filename}',
            'clip_filename': clip.clip_filename
        })
    return jsonify(result)

@app.route('/api/delete_clip/<int:clip_id>', methods=['DELETE'])
def delete_clip(clip_id):
    clip = Clip.query.get(clip_id)
    if clip:
        clip_path = os.path.join(CLIP_FOLDER, clip.clip_filename)
        if os.path.exists(clip_path):
            os.remove(clip_path)
        db.session.delete(clip)
        db.session.commit()
        return jsonify({'message': 'Clip deleted'})
    else:
        return jsonify({'error': 'Clip not found'}), 404

@app.route('/api/delete_original/<original_filename>', methods=['DELETE'])
def delete_original(original_filename):
    clips = Clip.query.filter_by(original_filename=original_filename).all()
    for clip in clips:
        clip_path = os.path.join(CLIP_FOLDER, clip.clip_filename)
        if os.path.exists(clip_path):
            os.remove(clip_path)
        db.session.delete(clip)
    db.session.commit()
    return jsonify({'message': 'Original video and all clips deleted'})

@app.route('/api/rename_original', methods=['PUT'])
def rename_original():
    data = request.get_json()
    old_name = data.get('old_name')
    new_name = data.get('new_name')

    clips = Clip.query.filter_by(original_filename=old_name).all()
    for clip in clips:
        old_clip_path = os.path.join(CLIP_FOLDER, clip.clip_filename)
        new_clip_filename = new_name + clip.clip_filename[len(old_name):]
        new_clip_path = os.path.join(CLIP_FOLDER, new_clip_filename)

        if os.path.exists(old_clip_path):
            os.rename(old_clip_path, new_clip_path)

        clip.clip_filename = new_clip_filename
        clip.original_filename = new_name
        db.session.commit()
    return jsonify({'message': 'Original video and all clips renamed'})

if __name__ == '__main__':
    app.run(port=3001, debug=True)
