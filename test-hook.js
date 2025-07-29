// Test direct du nouveau hook useHFLLM
// Ce script simule l'utilisation du hook

const API_KEY = "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";

async function testProcessText(transcript) {
  console.log('Testing processText with:', transcript);
  
  try {
    // Try the new chat completions API first
    console.log('Trying new HF API...');
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.1-8B-Instruct",
        messages: [
          {
            role: "user",
            content: `Please structure this running session transcript into clear bullet points. Focus on the key points mentioned:

"${transcript}"

Format your response as bullet points starting with • symbols.`
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      })
    });

    if (response.ok) {
      const data = await response.json();
      const processedText = data.choices[0]?.message?.content || '';
      
      if (processedText) {
        console.log('✅ New API SUCCESS!');
        console.log('Processed text:', processedText);
        return { success: true, processedText };
      }
    } else {
      console.log('❌ New API failed:', response.status, await response.text());
    }
  } catch (err) {
    console.log('❌ New API error:', err.message);
  }

  // Fallback: Create structured text without AI
  console.log('📝 Using local text processing fallback...');
  
  const sentences = transcript
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 5);
  
  let processedText = '';
  if (sentences.length > 0) {
    processedText = sentences
      .slice(0, 5) // Limit to 5 main points
      .map(sentence => `• ${sentence.charAt(0).toUpperCase() + sentence.slice(1)}`)
      .join('\n');
  } else {
    processedText = `• Session d'entraînement: ${transcript}`;
  }

  console.log('✅ Fallback SUCCESS!');
  console.log('Processed text:', processedText);
  return { success: true, processedText };
}

// Test avec un exemple de transcript
const testTranscript = "Je suis allé courir pendant 30 minutes aujourd'hui. C'était assez difficile mais je me sentais bien. Le temps était agréable et j'ai maintenu un bon rythme.";

testProcessText(testTranscript);
