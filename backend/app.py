from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import os
from TTS import TrainingAdvisor, SpeechGenerator
import io

app = Flask(__name__)
CORS(app)

# Configuration
TTS_PROVIDER = 'gtts'  # Change to 'elevenlabs' for production

@app.route('/api/training-advice', methods=['GET'])
def get_training_advice():
    """Get personalized training advice based on mental score"""
    try:
        # Initialize components
        advisor = TrainingAdvisor('dummy_training_summary.csv', 'TrainingMenu.csv')
        speech_gen = SpeechGenerator(TTS_PROVIDER)
        
        # Generate training advice
        result = advisor.generate_advice()
        if result[0] is None:
            return jsonify({'error': 'Score not found'}), 404
        
        phrase, recommendations, score = result
        
        # Generate speech
        audio_file = speech_gen.generate_speech(phrase, recommendations)
        
        return jsonify({
            'advice': phrase,
            'recommendations': recommendations,
            'mental_score': score,
            'audio_file': audio_file
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/audio/<filename>', methods=['GET'])
def get_audio(filename):
    """Serve generated audio files"""
    try:
        return send_file(filename, mimetype='audio/mpeg')
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'AI Training Coach API'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)