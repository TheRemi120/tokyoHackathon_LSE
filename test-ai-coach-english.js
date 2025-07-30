// Test pour vérifier que l'AI Coach génère des messages en anglais avec des détails spécifiques
const testPrompt = async () => {
  console.log('🧪 Testing AI Coach English Prompt\n');

  const mockRecommendation = {
    category: 'moderate',
    averageScore: 6.2,
    recommendedLaps: '4-5',
    reasoning: 'Your 6.2/10 average shows steady performance. Maintain consistent effort to build endurance.',
    message: 'Based on your recent scores (6/10, 7/10, 5/10, 6/10, 7/10), let\'s maintain steady progress: target 4-5 laps with consistent effort. Focus on maintaining good form and breathing rhythm. Your audio coach has the details—time to hit the track!'
  };

  console.log('📋 Test Data:');
  console.log('Category:', mockRecommendation.category);
  console.log('Average Score:', mockRecommendation.averageScore);
  console.log('Recommended Laps:', mockRecommendation.recommendedLaps);
  console.log('\n📝 Original Message:');
  console.log(mockRecommendation.message);
  console.log('\n');

  // Test examples of good responses (what we want)
  const goodResponses = [
    "Your steady 6.2/10 performance shows you're ready for 4-5 consistent laps at a moderate pace. Focus on maintaining proper form and controlled breathing throughout each lap.",
    "With your current fitness level, aim for 4-5 laps at 70-80% effort, keeping your cadence steady around 170-180 steps per minute. Maintain relaxed shoulders and efficient stride length.",
    "Target 4-5 laps with a focus on consistent pacing - start easy and gradually find your rhythm. Keep your core engaged and land midfoot to maximize efficiency and reduce impact."
  ];

  // Test examples of bad responses (what we don't want)
  const badResponses = [
    "Improve this running coaching message (max 2 sentences in English, be specific about training details)...",
    "Performance Analysis: Category: moderate Average Score: 6.2/10...",
    "Écoutez votre cœur, dépassez vos frontières ! Je vous vois franchir les 4-5 tours avec une énergie incroyable.",
    "You should run better and faster. Good luck with your training session today."
  ];

  function validateResponse(response, originalMessage) {
    const lower = response.toLowerCase();
    
    // Check for prompt keywords (bad)
    const hasPromptKeywords = [
      'improve this', 'coaching message', 'max 2 sentences', 
      'training details', 'performance analysis'
    ].some(keyword => lower.includes(keyword));
    
    // Check for French text (bad)
    const hasFrenchText = [
      'écoutez', 'votre', 'cœur', 'dépassez', 'frontières', 
      'je vous vois', 'tours', 'énergie', 'incroyable'
    ].some(word => lower.includes(word));
    
    // Check for specific training details (good)
    const hasSpecificDetails = [
      'pace', 'form', 'breathing', 'cadence', 'effort', 'stride',
      'midfoot', 'core', 'shoulders', 'steps per minute', '%'
    ].some(detail => lower.includes(detail));
    
    // Check basic quality
    const isLongEnough = response.length > 30;
    const isDifferent = response !== originalMessage;
    const isReasonableLength = response.length < 300;
    
    return {
      valid: !hasPromptKeywords && !hasFrenchText && isLongEnough && isDifferent && isReasonableLength,
      hasPromptKeywords,
      hasFrenchText,
      hasSpecificDetails,
      isLongEnough,
      isDifferent,
      isReasonableLength
    };
  }

  console.log('✅ Testing Good Responses:');
  goodResponses.forEach((response, i) => {
    const result = validateResponse(response, mockRecommendation.message);
    console.log(`\nGood Response ${i + 1}:`);
    console.log(`"${response}"`);
    console.log(`Valid: ${result.valid} | Specific Details: ${result.hasSpecificDetails} | English: ${!result.hasFrenchText}`);
  });

  console.log('\n❌ Testing Bad Responses:');
  badResponses.forEach((response, i) => {
    const result = validateResponse(response, mockRecommendation.message);
    console.log(`\nBad Response ${i + 1}:`);
    console.log(`"${response}"`);
    console.log(`Valid: ${result.valid} | Has Prompt: ${result.hasPromptKeywords} | French: ${result.hasFrenchText}`);
  });

  console.log('\n🎯 Expected Characteristics of Good AI Coach Messages:');
  console.log('✅ Written in English only');
  console.log('✅ Contains specific training details (pace, form, breathing, etc.)');
  console.log('✅ Mentions exact lap count and effort level');
  console.log('✅ Provides actionable advice (cadence, form cues, etc.)');
  console.log('✅ 30-300 characters in length');
  console.log('✅ Different from original message');
  console.log('❌ No prompt keywords or meta-commentary');
  console.log('❌ No French text');

  console.log('\n🔧 Updated Prompt Structure:');
  console.log('System: "You are an experienced running coach... Always respond in English only..."');
  console.log('User: "Improve this running coaching message... be specific about training details..."');
  console.log('Expected: Specific, actionable English coaching advice');
};

testPrompt();
