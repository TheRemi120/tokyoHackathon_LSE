# Guide de Débogage - AI Coach TTS

## Problème Résolu
❌ **Avant**: La synthèse vocale lisait le prompt "Refine this running coach message..." au lieu du message de coaching
✅ **Après**: La synthèse vocale lit maintenant le vrai message de coaching basé sur les activités

## Améliorations Apportées

### 1. Validation du Message LLM
- ✅ Détection et rejet des réponses contenant du texte de prompt
- ✅ Validation de la longueur minimale (20 caractères)
- ✅ Nettoyage des guillemets et formatage indésirable
- ✅ Fallback vers le message original si le LLM échoue

### 2. Amélioration de la Synthèse Vocale
- ✅ Validation du texte avant envoi à ElevenLabs
- ✅ Détection de texte de prompt dans le contenu TTS
- ✅ Timeout augmenté à 8 secondes pour de meilleurs résultats
- ✅ Paramètres vocaux optimisés pour un coaching plus naturel

### 3. Débogage Détaillé
- ✅ Logs console pour traquer chaque étape
- ✅ Messages d'erreur spécifiques pour diagnostiquer les problèmes
- ✅ Validation des messages avant TTS

## Comment Tester

### 1. Ouvrir les DevTools
1. Dans Chrome/Edge: F12 ou Cmd+Option+I
2. Aller dans l'onglet "Console"

### 2. Cliquer sur "Get AI Coaching"
Vous devriez voir dans la console:
```
🏃‍♂️ Starting AI Coach generation...
📊 Fetching recent activities...
📈 Found X recent activities
🔍 Analyzing performance...
💡 Analysis complete: {category: "...", message: "..."}
🤖 Starting LLM refinement for message: ...
📝 LLM result: {...}
✅ Using refined message (ou 📝 Using original message)
🔊 Starting TTS for: Basé sur vos scores récents...
🎵 Playing TTS audio...
✅ TTS playback completed
✅ AI Coach generation completed in XXXms
```

### 3. Vérifications
- ✅ Le message affiché ne contient pas "Refine this"
- ✅ Le message parle de vos scores récents et recommande des tours
- ✅ La voix lit le bon message (pas le prompt)

## Messages Attendus

### Performance Faible (≤ 4/10)
> "Basé sur vos scores récents (3/10, 4/10, 4/10, 2/10, 3/10), relâchons un peu aujourd'hui : visez 2-3 tours détendus..."

### Performance Modérée (4-8/10)
> "Basé sur vos scores récents (6/10, 7/10, 5/10, 6/10, 7/10), maintenons un progrès régulier : ciblez 4-5 tours..."

### Haute Performance (≥ 8/10)
> "Basé sur vos scores récents (8/10, 9/10, 8/10, 9/10, 8/10), vous êtes prêt à pousser plus fort : défiez-vous avec 6-7 tours..."

### Nouvel Utilisateur
> "Prêt à commencer votre parcours de course ? Commençons par une session confortable de 3-4 tours..."

## Dépannage

### Si la voix lit encore le prompt:
1. Vérifiez les logs console
2. Cherchez "⚠️ LLM returned invalid response"
3. Le système devrait automatiquement utiliser le message original

### Si pas de voix du tout:
1. Vérifiez "🔑 ElevenLabs API key not found" dans la console
2. Assurez-vous que VITE_ELEVENLABS_API_KEY est défini
3. Vérifiez "❌ TTS generation failed" pour les erreurs API

### Si le message ne change pas:
1. Vérifiez que vous avez des activités avec des scores dans Supabase
2. Regardez "📈 Found X recent activities" dans la console
3. Vérifiez que les activités ont `reviewed = true` et `score IS NOT NULL`

## Test Manuel Rapide
Exécutez dans la console du navigateur:
```javascript
// Test rapide du système d'analyse
const mockActivities = [
  {score: 3}, {score: 4}, {score: 4}, {score: 2}, {score: 3}
];
const avg = mockActivities.reduce((s,a) => s + a.score, 0) / mockActivities.length;
console.log('Average:', avg, 'Category:', avg <= 4 ? 'underperforming' : avg < 8 ? 'moderate' : 'high');
```

Le système est maintenant robuste et devrait fonctionner correctement !
