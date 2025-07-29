import csv
import re
import os
from gtts import gTTS
import subprocess

# Configuration - Set to 'gtts' for free testing, 'elevenlabs' for production
TTS_PROVIDER = 'gtts'  # Change to 'elevenlabs' for production

class TrainingAdvisor:
    """Handles training menu recommendation logic and LLM processing"""
    
    def __init__(self, summary_path, menu_path):
        self.summary_path = summary_path
        self.menu_path = menu_path
    
    def get_latest_mental_score(self):
        """Extract the latest mental score from the summary CSV"""
        with open(self.summary_path, encoding='utf-8') as f:
            reader = csv.reader(f)
            rows = list(reader)
            # Find the latest row (after header) where Estimated Mental Score is not empty
            for row in reversed(rows):
                if len(row) > 5 and row[5]:
                    match = re.search(r'(\d+)/10', row[5])
                    if match:
                        return int(match.group(1))
        return None
    
    def score_to_intensity(self, score):
        """Convert mental score to training intensity level"""
        if score <= 2:
            return 'light'
        elif score <= 4:
            return 'moderate'
        elif score <= 6:
            return 'normal'
        elif score <= 8:
            return 'energetic'
        else:
            return 'intense'
    
    def intensity_to_phrase(self, intensity):
        """Generate motivational phrase based on intensity level"""
        phrases = {
            'light': "Today, let's take it easy and focus on gently loosening up your body.",
            'moderate': "Let's gradually build up your energy and get into the flow.",
            'normal': "You're in your usual good form today. Let's work with your natural rhythm.",
            'energetic': "You seem to be in great shape today! Let's push ourselves a bit more.",
            'intense': "You're absolutely on fire today! Let's go all out and challenge ourselves!"
        }
        return phrases.get(intensity, '')
    
    def recommend_menu(self, target_intensity):
        """Get training menu recommendations based on intensity"""
        with open(self.menu_path, encoding='utf-8') as f:
            reader = csv.DictReader(f)
            category_to_menu = {}
            for row in reader:
                # Look for the intensity level in the training menu description
                if target_intensity in row['Training Menu'].lower():
                    cat = row['Training Category']
                    if cat not in category_to_menu:
                        category_to_menu[cat] = row['Training Menu']
            return category_to_menu
    
    def generate_advice(self):
        """Main method to generate complete training advice"""
        score = self.get_latest_mental_score()
        if score is None:
            return None, None, None
        
        intensity = self.score_to_intensity(score)
        phrase = self.intensity_to_phrase(intensity)
        recommendations = self.recommend_menu(intensity)
        
        return phrase, recommendations, score

class SpeechGenerator:
    """Handles text-to-speech generation with multiple providers"""
    
    def __init__(self, provider='gtts'):
        self.provider = provider
        if provider == 'elevenlabs':
            ELEVEN_API_KEY = "sk_7e13c835a433beee5d29d710bbbd4898f85f2c49313ebe61"
    
    def create_gtts_speech(self, phrase, recommendations):
        """Generate speech using free gTTS (Google Text-to-Speech)"""
        # Compose natural, varied speech without repetition
        speech = []
        speech.append("Today's advice:")
        speech.append(phrase)
        speech.append("Here's your training plan:")
        
        # Create varied descriptions for each category
        categories = list(recommendations.keys())
        for i, (cat, menu) in enumerate(recommendations.items()):
            # Remove the repetitive intensity word from menu description
            clean_menu = menu.split()[:-1]  # Remove the last word (intensity level)
            clean_menu = ' '.join(clean_menu)
            
            # Use varied connecting phrases
            if i == 0:
                speech.append(f"Start with {cat.lower()}: {clean_menu}")
            elif i == len(categories) - 1:
                speech.append(f"And finish with {cat.lower()}: {clean_menu}")
            else:
                speech.append(f"Then move to {cat.lower()}: {clean_menu}")
        
        speech.append("Remember to enjoy your workout and listen to your body!")
        full_text = ' '.join(speech)
        
        # Generate speech with gTTS
        tts = gTTS(text=full_text, lang='en', slow=False)
        tts.save("training_advice.mp3")
        return "training_advice.mp3"
    
    def create_elevenlabs_speech(self, phrase, recommendations):
        """Generate speech using ElevenLabs (requires credits)"""
        from elevenlabs.client import ElevenLabs
        from elevenlabs import save
        
        client = ElevenLabs(api_key=ELEVEN_API_KEY)
        
        # Compose natural, varied speech without repetition
        speech = []
        speech.append("Today's advice:")
        speech.append(phrase)
        speech.append("Your training plan:")
        
        # Create varied descriptions for each category
        categories = list(recommendations.keys())
        for i, (cat, menu) in enumerate(recommendations.items()):
            # Remove the repetitive intensity word from menu description
            clean_menu = menu.split()[:-1]  # Remove the last word (intensity level)
            clean_menu = ' '.join(clean_menu)
            
            # Use varied connecting phrases
            if i == 0:
                speech.append(f"Start with {cat.lower()}: {clean_menu}")
            elif i == len(categories) - 1:
                speech.append(f"And finish with {cat.lower()}: {clean_menu}")
            else:
                speech.append(f"Then move to {cat.lower()}: {clean_menu}")
        
        speech.append("Remember to enjoy your workout!")
        full_text = ' '.join(speech)
        
        # Use the correct ElevenLabs API
        audio_stream = client.text_to_speech.convert(
            voice_id="21m00Tcm4TlvDq8ikWAM",  # Rachel voice ID
            text=full_text,
            model_id="eleven_monolingual_v1"
        )
        
        # Save the audio to a file
        save(audio_stream, "training_advice.mp3")
        return "training_advice.mp3"
    
    def generate_speech(self, phrase, recommendations):
        """Generate speech using the configured provider"""
        try:
            if self.provider == 'gtts':
                print(f"🎤 Using {self.provider.upper()} (free) for speech generation...")
                audio_file = self.create_gtts_speech(phrase, recommendations)
                print(f"✅ {self.provider.upper()} speech output complete! Audio saved as {audio_file}")
                
            elif self.provider == 'elevenlabs':
                print(f"🎤 Using {self.provider.upper()} (premium) for speech generation...")
                audio_file = self.create_elevenlabs_speech(phrase, recommendations)
                print(f"✅ {self.provider.upper()} speech output complete! Audio saved as {audio_file}")
                
            else:
                raise ValueError(f"Unknown TTS provider: {self.provider}")
            
            return audio_file
            
        except Exception as e:
            print(f"❌ Speech generation error: {e}")
            print("Continuing with text output only.")
            return None
    
    def play_audio(self, audio_file):
        """Play the generated audio file"""
        if audio_file is None:
            return
            
        try:
            subprocess.run(["afplay", audio_file])
            print("🔊 Audio playback complete!")
        except Exception as e:
            print(f"❌ Audio playback error: {e}")

def main():
    """Main execution function"""
    # Initialize components
    advisor = TrainingAdvisor('dummy_training_summary.csv', 'TrainingMenu.csv')
    speech_gen = SpeechGenerator(TTS_PROVIDER)
    
    # Generate training advice
    result = advisor.generate_advice()
    if result is None:
        print('Score not found.')
        return
    
    phrase, recommendations, score = result
    
    # Display text output
    print(f"[Today's Advice]")
    print(phrase)
    print()
    print('Here are your recommended training menus for today:')
    
    # Create varied descriptions for each category
    categories = list(recommendations.keys())
    for i, (cat, menu) in enumerate(recommendations.items()):
        # Remove the repetitive intensity word from menu description
        clean_menu = menu.split()[:-1]  # Remove the last word (intensity level)
        clean_menu = ' '.join(clean_menu)
        
        # Use varied connecting phrases
        if i == 0:
            print(f'• Start with {cat}: {clean_menu}')
        elif i == len(categories) - 1:
            print(f'• And finish with {cat}: {clean_menu}')
        else:
            print(f'• Then move to {cat}: {clean_menu}')
    
    print('\nRemember to enjoy each exercise and listen to your body!')
    
    # Generate and play speech
    audio_file = speech_gen.generate_speech(phrase, recommendations)
    speech_gen.play_audio(audio_file)

if __name__ == "__main__":
    main()