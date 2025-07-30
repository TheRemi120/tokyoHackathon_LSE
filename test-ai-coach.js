// Test script for AI Coach functionality
// This simulates the workflow without requiring actual database calls

const mockActivities = [
  { id: '1', date: '2025-01-25', distance: 5, score: 3 },
  { id: '2', date: '2025-01-26', distance: 3, score: 4 },
  { id: '3', date: '2025-01-27', distance: 4, score: 4 },
  { id: '4', date: '2025-01-28', distance: 6, score: 5 },
  { id: '5', date: '2025-01-29', distance: 5, score: 3 }
];

function analyzePerformance(activities) {
  if (activities.length === 0) {
    return {
      category: 'moderate',
      averageScore: 5,
      recommendedLaps: '3-4',
      reasoning: 'No recent activities found - starting with baseline assessment.',
      message: 'Ready to start your running journey? Let\'s begin with a comfortable 3-4 lap session to establish your baseline. Focus on maintaining a steady pace and listening to your body.'
    };
  }

  // Ensure we only analyze the most recent 5 activities
  const recentActivities = activities.slice(0, 5);
  const averageScore = recentActivities.reduce((sum, activity) => sum + activity.score, 0) / recentActivities.length;
  
  let category;
  let recommendedLaps;
  let reasoning;

  // Updated scoring thresholds as per requirements
  if (averageScore <= 4) {
    category = 'underperforming';
    recommendedLaps = '2-3';
    reasoning = `Recent average score of ${averageScore.toFixed(1)}/10 indicates you need recovery time and lighter training load.`;
  } else if (averageScore < 8) {
    category = 'moderate';
    recommendedLaps = '4-5';
    reasoning = `Your ${averageScore.toFixed(1)}/10 average shows steady performance. Maintain consistent effort to build endurance.`;
  } else {
    category = 'high';
    recommendedLaps = '6-7';
    reasoning = `Excellent ${averageScore.toFixed(1)}/10 average! You're ready for a more challenging session.`;
  }

  const scoresText = recentActivities.map(a => `${a.score}/10`).join(', ');
  let message = `Based on your recent scores (${scoresText}), `;
  
  switch (category) {
    case 'underperforming':
      message += `let's dial it back today: aim for ${recommendedLaps} relaxed laps focusing on steady pacing and recovery. You'll build strength without overtaxing yourself. I've sent this advice to your audio coach—let's get started!`;
      break;
    case 'moderate':
      message += `let's maintain steady progress: target ${recommendedLaps} laps with consistent effort. Focus on maintaining good form and breathing rhythm. Your audio coach has the details—time to hit the track!`;
      break;
    case 'high':
      message += `you're ready to push harder: challenge yourself with ${recommendedLaps} laps. Increase your pace gradually and see how strong you feel today! Your audio coach is ready with the motivation—let's go!`;
      break;
  }

  return {
    category,
    averageScore: Math.round(averageScore * 10) / 10,
    recommendedLaps,
    reasoning,
    message
  };
}

// Test different scenarios
console.log('🏃‍♂️ AI Coach Performance Analysis Test\n');

// Scenario 1: Underperforming (avg ≤ 4)
console.log('📊 Scenario 1: Underperforming (scores: 3, 4, 4, 5, 3)');
const underperforming = analyzePerformance(mockActivities);
console.log(`Category: ${underperforming.category}`);
console.log(`Average Score: ${underperforming.averageScore}/10`);
console.log(`Recommended Laps: ${underperforming.recommendedLaps}`);
console.log(`Message: ${underperforming.message}\n`);

// Scenario 2: Moderate (4 < avg < 8)
const moderateActivities = [
  { id: '1', date: '2025-01-25', distance: 5, score: 6 },
  { id: '2', date: '2025-01-26', distance: 3, score: 7 },
  { id: '3', date: '2025-01-27', distance: 4, score: 5 },
  { id: '4', date: '2025-01-28', distance: 6, score: 6 },
  { id: '5', date: '2025-01-29', distance: 5, score: 7 }
];

console.log('📊 Scenario 2: Moderate (scores: 6, 7, 5, 6, 7)');
const moderate = analyzePerformance(moderateActivities);
console.log(`Category: ${moderate.category}`);
console.log(`Average Score: ${moderate.averageScore}/10`);
console.log(`Recommended Laps: ${moderate.recommendedLaps}`);
console.log(`Message: ${moderate.message}\n`);

// Scenario 3: High (avg ≥ 8)
const highActivities = [
  { id: '1', date: '2025-01-25', distance: 5, score: 8 },
  { id: '2', date: '2025-01-26', distance: 3, score: 9 },
  { id: '3', date: '2025-01-27', distance: 4, score: 8 },
  { id: '4', date: '2025-01-28', distance: 6, score: 9 },
  { id: '5', date: '2025-01-29', distance: 5, score: 8 }
];

console.log('📊 Scenario 3: High Performance (scores: 8, 9, 8, 9, 8)');
const high = analyzePerformance(highActivities);
console.log(`Category: ${high.category}`);
console.log(`Average Score: ${high.averageScore}/10`);
console.log(`Recommended Laps: ${high.recommendedLaps}`);
console.log(`Message: ${high.message}\n`);

// Scenario 4: No activities
console.log('📊 Scenario 4: No Recent Activities');
const noActivities = analyzePerformance([]);
console.log(`Category: ${noActivities.category}`);
console.log(`Average Score: ${noActivities.averageScore}/10`);
console.log(`Recommended Laps: ${noActivities.recommendedLaps}`);
console.log(`Message: ${noActivities.message}\n`);

console.log('✅ All test scenarios completed!');
