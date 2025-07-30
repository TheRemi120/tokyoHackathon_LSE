// Test du système AI Coach avec débogage
// Ce script teste le comportement complet sans appels API réels

console.log('🏃‍♂️ Test du système AI Coach avec débogage détaillé\n');

// Simulation des données d'activité comme elles viendraient de Supabase
const mockActivitiesUnderperforming = [
  { id: '1', date: '2025-01-25', distance: 5, score: 3, created_at: '2025-01-25T10:00:00Z' },
  { id: '2', date: '2025-01-26', distance: 3, score: 4, created_at: '2025-01-26T10:00:00Z' },
  { id: '3', date: '2025-01-27', distance: 4, score: 4, created_at: '2025-01-27T10:00:00Z' },
  { id: '4', date: '2025-01-28', distance: 6, score: 2, created_at: '2025-01-28T10:00:00Z' },
  { id: '5', date: '2025-01-29', distance: 5, score: 3, created_at: '2025-01-29T10:00:00Z' }
];

const mockActivitiesHigh = [
  { id: '1', date: '2025-01-25', distance: 5, score: 8, created_at: '2025-01-25T10:00:00Z' },
  { id: '2', date: '2025-01-26', distance: 3, score: 9, created_at: '2025-01-26T10:00:00Z' },
  { id: '3', date: '2025-01-27', distance: 4, score: 8, created_at: '2025-01-27T10:00:00Z' },
  { id: '4', date: '2025-01-28', distance: 6, score: 9, created_at: '2025-01-28T10:00:00Z' },
  { id: '5', date: '2025-01-29', distance: 5, score: 8, created_at: '2025-01-29T10:00:00Z' }
];

function analyzePerformance(activities) {
  console.log(`📊 Analyse de ${activities.length} activités...`);
  
  if (activities.length === 0) {
    console.log('ℹ️ Aucune activité trouvée - utilisation du profil débutant');
    return {
      category: 'moderate',
      averageScore: 5,
      recommendedLaps: '3-4',
      reasoning: 'Aucune activité récente trouvée - évaluation de base.',
      message: 'Prêt à commencer votre parcours de course ? Commençons par une session confortable de 3-4 tours pour établir votre niveau de base. Concentrez-vous sur le maintien d\'un rythme régulier et l\'écoute de votre corps.'
    };
  }

  // S'assurer qu'on analyse seulement les 5 activités les plus récentes
  const recentActivities = activities.slice(0, 5);
  const averageScore = recentActivities.reduce((sum, activity) => sum + activity.score, 0) / recentActivities.length;
  
  console.log(`📈 Score moyen calculé: ${averageScore.toFixed(1)}/10`);
  
  let category;
  let recommendedLaps;
  let reasoning;

  // Seuils de scoring mis à jour selon les exigences
  if (averageScore <= 4) {
    category = 'underperforming';
    recommendedLaps = '2-3';
    reasoning = `Score moyen récent de ${averageScore.toFixed(1)}/10 indique que vous avez besoin de temps de récupération et d'une charge d'entraînement plus légère.`;
  } else if (averageScore < 8) {
    category = 'moderate';
    recommendedLaps = '4-5';
    reasoning = `Votre moyenne de ${averageScore.toFixed(1)}/10 montre une performance stable. Maintenez un effort constant pour développer l'endurance.`;
  } else {
    category = 'high';
    recommendedLaps = '6-7';
    reasoning = `Excellente moyenne de ${averageScore.toFixed(1)}/10 ! Vous êtes prêt pour une session plus challenging.`;
  }

  const scoresText = recentActivities.map(a => `${a.score}/10`).join(', ');
  let message = `Basé sur vos scores récents (${scoresText}), `;
  
  switch (category) {
    case 'underperforming':
      message += `relâchons un peu aujourd'hui : visez ${recommendedLaps} tours détendus en vous concentrant sur un rythme régulier et la récupération. Vous développerez votre force sans vous surmener. J'ai envoyé ces conseils à votre coach audio—c'est parti !`;
      break;
    case 'moderate':
      message += `maintenons un progrès régulier : ciblez ${recommendedLaps} tours avec un effort constant. Concentrez-vous sur le maintien d'une bonne forme et du rythme respiratoire. Votre coach audio a les détails—direction la piste !`;
      break;
    case 'high':
      message += `vous êtes prêt à pousser plus fort : défiez-vous avec ${recommendedLaps} tours. Augmentez progressivement votre rythme et voyez comme vous vous sentez fort aujourd'hui ! Votre coach audio est prêt avec la motivation—allons-y !`;
      break;
  }

  console.log(`🎯 Catégorie: ${category}`);
  console.log(`🏃 Tours recommandés: ${recommendedLaps}`);
  console.log(`💬 Message généré: ${message.substring(0, 100)}...`);

  return {
    category,
    averageScore: Math.round(averageScore * 10) / 10,
    recommendedLaps,
    reasoning,
    message
  };
}

// Test 1: Performance faible
console.log('=== TEST 1: Performance Faible (scores: 3, 4, 4, 2, 3) ===');
const result1 = analyzePerformance(mockActivitiesUnderperforming);
console.log(`✅ Résultat: ${result1.category} (${result1.averageScore}/10)`);
console.log(`📝 Message complet: "${result1.message}"\n`);

// Test 2: Haute performance  
console.log('=== TEST 2: Haute Performance (scores: 8, 9, 8, 9, 8) ===');
const result2 = analyzePerformance(mockActivitiesHigh);
console.log(`✅ Résultat: ${result2.category} (${result2.averageScore}/10)`);
console.log(`📝 Message complet: "${result2.message}"\n`);

// Test 3: Nouvel utilisateur
console.log('=== TEST 3: Nouvel Utilisateur (aucune activité) ===');
const result3 = analyzePerformance([]);
console.log(`✅ Résultat: ${result3.category} (${result3.averageScore}/10)`);
console.log(`📝 Message complet: "${result3.message}"\n`);

// Simulation de la validation du message
function validateCoachingMessage(message) {
  console.log('🔍 Validation du message de coaching...');
  
  const issues = [];
  
  // Vérifier que ce n'est pas le prompt
  if (message.toLowerCase().includes('refine this') || 
      message.toLowerCase().includes('max 2 sentences')) {
    issues.push('❌ Message contient du texte de prompt');
  }
  
  // Vérifier la longueur
  if (message.length < 20) {
    issues.push('❌ Message trop court');
  }
  
  if (message.length > 300) {
    issues.push('⚠️ Message peut-être trop long pour TTS');
  }
  
  // Vérifier qu'il y a des conseils d'entraînement
  if (!message.includes('tour') && !message.includes('lap')) {
    issues.push('⚠️ Pas de recommandation de tours spécifique');
  }
  
  if (issues.length === 0) {
    console.log('✅ Message valide pour TTS');
  } else {
    console.log('Issues trouvées:');
    issues.forEach(issue => console.log(`  ${issue}`));
  }
  
  return issues.length === 0;
}

console.log('=== VALIDATION DES MESSAGES ===');
validateCoachingMessage(result1.message);
validateCoachingMessage(result2.message);
validateCoachingMessage(result3.message);

console.log('\n🎉 Tests terminés ! Le système devrait maintenant générer des messages appropriés pour la synthèse vocale.');
