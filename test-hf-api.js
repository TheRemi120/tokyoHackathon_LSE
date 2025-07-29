// Test script pour vérifier l'API Hugging Face avec la nouvelle API
const API_KEY = "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"; // Votre token

async function testNewHFAPI() {
  try {
    console.log("Testing new Hugging Face API...");
    
    // D'abord, testons quels modèles sont disponibles
    console.log("Fetching available models...");
    const modelsResponse = await fetch("https://router.huggingface.co/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
      }
    });
    
    if (modelsResponse.ok) {
      const models = await modelsResponse.json();
      console.log("Available models:", models.data?.slice(0, 10).map(m => m.id) || "No models found");
      
      // Utilisons le premier modèle disponible
      if (models.data && models.data.length > 0) {
        const modelId = models.data[0].id;
        console.log(`\nTrying with model: ${modelId}`);
        
        const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelId,
            messages: [
              {
                role: "user",
                content: "Structure this running session into bullet points: I went for a 30 minute run today. It was challenging but I felt good. The weather was nice."
              }
            ],
            max_tokens: 150,
            temperature: 0.7
          })
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          return;
        }

        const data = await response.json();
        console.log("Success! Response data:", JSON.stringify(data, null, 2));
      }
    } else {
      console.log("Failed to fetch models:", await modelsResponse.text());
    }
    
  } catch (error) {
    console.error("Network error:", error);
  }
}

testNewHFAPI();
