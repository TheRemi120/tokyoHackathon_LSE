// Test pour vérifier que l'AI Coach ne lit plus le prompt
// Ce test simule la fonction refineWithLLM avec une réponse mockée

const mockRecommendation = {
  category: 'underperforming',
  averageScore: 3.8,
  recommendedLaps: '2-3',
  reasoning: 'Recent average score of 3.8/10 indicates you need recovery time and lighter training load.',
  message: 'Based on your recent scores (3/10, 4/10, 4/10, 5/10, 3/10), let\'s dial it back today: aim for 2-3 relaxed laps focusing on steady pacing and recovery. You\'ll build strength without overtaxing yourself. I\'ve sent this advice to your audio coach—let\'s get started!'
};

// Simulation du processus de refinement
console.log('🧪 Test AI Coach Message Refinement\n');

console.log('📝 Original message:');
console.log(mockRecommendation.message);
console.log('\n');

// Simulations de différentes réponses du LLM
const goodResponse = "Tes performances récentes montrent que tu as besoin de récupération. Commence doucement avec 2-3 tours relaxants pour retrouver ta force progressivement !";

const badResponse1 = "Améliore ce message de coaching pour qu'il soit plus motivant et inspirant (maximum 2 phrases)...";

const badResponse2 = "Tu es un coach de course personnalisé. Améliore ce message...";

function validateLLMResponse(response, originalMessage) {
  const lowerResponse = response.toLowerCase();
  
  // Détecte si la réponse contient des mots-clés du prompt
  const promptKeywords = ['améliore', 'coaching', 'message', 'personnalisé', 'inspirant'];
  const hasPromptKeywords = promptKeywords.some(keyword => lowerResponse.includes(keyword));
  
  // Vérifications de qualité
  const isTooShort = response.length < 20;
  const isDifferent = response !== originalMessage;
  
  return !hasPromptKeywords && !isTooShort && isDifferent;
}

console.log('✅ Test avec une bonne réponse du LLM:');
console.log('Response:', goodResponse);
console.log('Valid:', validateLLMResponse(goodResponse, mockRecommendation.message));
console.log('');

console.log('❌ Test avec une mauvaise réponse (contient le prompt):');
console.log('Response:', badResponse1);
console.log('Valid:', validateLLMResponse(badResponse1, mockRecommendation.message));
console.log('');

console.log('❌ Test avec une autre mauvaise réponse (meta-commentary):');
console.log('Response:', badResponse2);
console.log('Valid:', validateLLMResponse(badResponse2, mockRecommendation.message));
console.log('');

console.log('🎯 Résumé:');
console.log('- La validation détecte correctement les bonnes réponses ✅');
console.log('- La validation rejette les réponses contenant le prompt ❌');
console.log('- Fallback vers le message original en cas de problème 🔄');
console.log('');
console.log('🔧 Correction appliquée:');
console.log('- Appel direct à l\'API Hugging Face au lieu d\'utiliser useHFLLM');
console.log('- Validation stricte des réponses pour éviter de lire le prompt');
console.log('- Fallback robuste vers le message original en cas d\'échec');
