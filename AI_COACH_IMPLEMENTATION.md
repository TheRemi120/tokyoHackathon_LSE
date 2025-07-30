# AI Coach Implementation Documentation

## Overview
The AI Coach feature provides personalized training recommendations based on the user's recent performance scores. When the user taps the "AI Coach" button, the system analyzes their last five activities and suggests an appropriate training session.

## Implementation Details

### Core Components

#### 1. Data Retrieval (`fetchRecentActivities`)
- Fetches the user's last 5 reviewed activities from Supabase
- Includes: date, distance, and performance score (1-10)
- Implements 2-second timeout for fast response
- Returns structured `ActivitySummary[]`

#### 2. Performance Analysis (`analyzePerformance`)
- Calculates average score from up to 5 recent activities
- Categorizes performance based on scoring thresholds:
  - **Underperforming**: average ≤ 4 → recommends 2-3 laps
  - **Moderate**: 4 < average < 8 → recommends 4-5 laps  
  - **High**: average ≥ 8 → recommends 6-7 laps
- Generates structured coaching message with scores and reasoning

#### 3. LLM Refinement (`refineWithLLM`)
- Makes direct API call to Hugging Face for message enhancement
- Uses chat completions format with system/user messages
- Implements strict response validation to prevent reading prompts aloud
- Includes timeout protection (3 seconds) and proper error handling
- Falls back to original message if refinement fails or produces meta-commentary

#### 4. Text-to-Speech (`generateTTS`)
- Converts the coaching message to audio using ElevenLabs
- Runs in background (non-blocking) for better UX
- Uses Rachel voice with optimized settings
- Implements 5-second timeout and proper error handling

#### 5. Main Orchestration (`generateCoaching`)
- Coordinates all steps with performance monitoring
- Runs operations in parallel where possible
- Tracks total execution time
- Provides detailed error handling with contextual fallbacks

## Performance Optimizations

### Response Time < 500ms Target
1. **Parallel Processing**: LLM refinement and TTS preparation run concurrently
2. **Timeouts**: Database (2s), LLM (3s), TTS (5s) 
3. **Non-blocking TTS**: Audio generation doesn't block UI response
4. **Optimized Prompts**: Shorter, focused prompts for faster LLM processing
5. **Efficient Queries**: Limited to 5 most recent activities only

### Error Handling & Fallbacks
1. **Database timeout**: Uses fallback message for new users
2. **LLM failure**: Returns original structured message
3. **TTS failure**: Silent failure, text still displayed
4. **Authentication errors**: Provides welcome message

## API Integrations

### Supabase Database
```sql
SELECT id, created_at, distance, score 
FROM activities 
WHERE user_id = ? AND reviewed = true AND score IS NOT NULL
ORDER BY created_at DESC 
LIMIT 5
```

### Hugging Face LLM
- Model: `meta-llama/Llama-3.1-8B-Instruct`
- Endpoint: `https://router.huggingface.co/v1/chat/completions`
- Optimized prompt for motivational coaching refinement

### ElevenLabs TTS
- Voice ID: `21m00Tcm4TlvDq8ikWAM` (Rachel)
- Model: `eleven_monolingual_v1`
- Optimized voice settings for coaching tone

## Usage Example

```typescript
const { generateCoaching, isGenerating, isPlaying } = useAICoach();

const handleAICoachClick = async () => {
  const coachingMessage = await generateCoaching();
  // Message is displayed in UI and played via TTS
};
```

## Expected Output Format

> "Based on your recent scores (3/10, 4/10, 4/10, 5/10, 3/10), let's dial it back today: aim for 2-3 relaxed laps focusing on steady pacing and recovery. You'll build strength without overtaxing yourself. I've sent this advice to your audio coach—let's get started!"

## Performance Metrics

- **Target**: < 500ms total response time
- **Database Query**: ~100-200ms
- **Performance Analysis**: ~1-5ms (instant)
- **LLM Refinement**: ~200-300ms (with timeout)
- **TTS Generation**: Background (3-5 seconds)
- **Total UI Response**: ~300-500ms

## Chain of Thought Process

1. **Data Collection**: "Let me check your recent performance..."
2. **Analysis**: "Your average score is X/10, which indicates Y performance level"
3. **Recommendation**: "Based on this analysis, I recommend Z laps because..."
4. **Motivation**: "This will help you achieve ABC goals"
5. **Action**: "Your audio coach has the details—let's get started!"

## Testing Scenarios

- ✅ Underperforming user (avg ≤ 4)
- ✅ Moderate performer (4 < avg < 8)  
- ✅ High performer (avg ≥ 8)
- ✅ New user with no activities
- ✅ Database connection issues
- ✅ LLM API failures
- ✅ TTS API failures

## Future Enhancements

1. **Personalization**: Consider user preferences, goals, weather
2. **Context Awareness**: Time of day, recent training load
3. **Advanced Analytics**: Trend analysis, fatigue prediction
4. **Multi-language**: Support for different languages
5. **Offline Mode**: Local processing for core functionality
