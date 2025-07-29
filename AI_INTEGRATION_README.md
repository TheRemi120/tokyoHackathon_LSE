# AI-Enhanced Running Activity Logger

## Overview

This application combines Speech-to-Text (STT) and Large Language Model (LLM) processing to create structured activity logs from voice recordings. Users can record their running session reviews, which are automatically transcribed and structured into bullet points by AI.

## Features

### Enhanced Review Activity Button
- **Voice Recording**: Record audio using MediaRecorder API
- **Speech-to-Text**: Transcribe audio using ElevenLabs STT service
- **AI Processing**: Structure transcripts into bullet points using Hugging Face Mistral-7B
- **Automatic Saving**: Save structured reviews to activity logs

### Enhanced Review Component
- **Manual Text Input**: Type reviews manually
- **Voice Input**: Add text via speech-to-text
- **AI Structuring**: Structure existing text with AI button
- **Real-time Processing**: Visual feedback for each processing step

## Setup Instructions

### 1. Environment Variables

Add your API keys to the `.env` file:

```env
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
VITE_HF_TOKEN=your_hugging_face_token
```

### 2. Get Hugging Face Token

1. Visit [Hugging Face](https://huggingface.co)
2. Sign up or log in
3. Go to Settings → Access Tokens
4. Create a new token with "Read" permissions
5. Copy the token to your `.env` file

### 3. Get ElevenLabs API Key

1. Visit [ElevenLabs](https://elevenlabs.io)
2. Sign up or log in
3. Go to your Profile → API Keys
4. Create a new API key
5. Copy the key to your `.env` file

### 4. Install Dependencies

```bash
npm install
# or
bun install
```

### 5. Run Development Server

```bash
npm run dev
# or
bun dev
```

## Architecture

### Custom Hooks

#### `useHFLLM`
- Handles Hugging Face LLM API calls
- Processes text into structured bullet points
- Provides loading states and error handling

#### `useSTT` (Enhanced)
- MediaRecorder integration for audio capture
- ElevenLabs STT API integration
- Audio blob processing and transcription

### Processing Workflow

1. **Audio Recording** → MediaRecorder captures audio
2. **Speech-to-Text** → ElevenLabs transcribes audio to text
3. **LLM Processing** → Hugging Face structures text into bullet points
4. **Database Save** → Structured review saved to Supabase

### Error Handling

- **STT Failure**: Falls back to manual text input
- **LLM Failure**: Uses original transcript with warning
- **Network Issues**: Displays user-friendly error messages
- **API Rate Limits**: Graceful degradation with feedback

## API Endpoints

### Hugging Face LLM
- **Endpoint**: `https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1`
- **Model**: Mistral-7B-Instruct-v0.1
- **Purpose**: Structure text into bullet points

### ElevenLabs STT
- **Endpoint**: `https://api.elevenlabs.io/v1/speech-to-text`
- **Model**: scribe_v1
- **Purpose**: Audio transcription

## User Experience

### Visual Feedback
- **Recording**: Red pulsing indicator with microphone icon
- **Transcribing**: Blue indicator with microphone icon
- **AI Processing**: Purple indicator with brain icon
- **Saving**: Green indicator with save icon

### Progressive Enhancement
- Works without AI (manual text input)
- Falls back gracefully when APIs fail
- Provides clear status updates throughout process

## Technology Stack

- **Frontend**: React + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **State Management**: React Hooks
- **Audio**: MediaRecorder API
- **STT**: ElevenLabs API
- **LLM**: Hugging Face Inference API
- **Database**: Supabase
- **Build Tool**: Vite

## Browser Compatibility

- **Chrome/Edge**: Full support (MediaRecorder)
- **Firefox**: Full support (MediaRecorder)
- **Safari**: Full support (MediaRecorder with limitations)
- **Mobile**: Progressive Web App features

## Performance Considerations

- **Audio Format**: WebM with Opus codec for efficiency
- **LLM Timeout**: 30-second timeout for API calls
- **Token Limits**: 500 max tokens for structured output
- **Error Recovery**: Automatic fallback to original text

## Future Enhancements

- **Activity Data Extraction**: Parse transcript for duration, distance, pace
- **Custom Prompts**: User-defined structuring templates
- **Offline Support**: Local STT/LLM processing
- **Voice Commands**: Navigate app with voice
- **Multi-language**: Support for multiple languages

## Troubleshooting

### Common Issues

1. **Microphone Access Denied**
   - Check browser permissions
   - Ensure HTTPS (required for MediaRecorder)

2. **STT API Errors**
   - Verify ElevenLabs API key
   - Check audio format compatibility

3. **LLM Processing Fails**
   - Verify Hugging Face token
   - Check model availability (may need warmup)

4. **No Audio Recording**
   - Ensure microphone is connected
   - Check browser compatibility

### Debug Mode

Enable detailed logging by setting:
```javascript
localStorage.setItem('debug', 'true');
```
