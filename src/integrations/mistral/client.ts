export const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
export const MISTRAL_API_KEY = ""; // Insert your API key here

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const fetchMotivation = async (): Promise<string> => {
  const body = {
    model: "mistral-small",
    messages: [
      {
        role: "user",
        content:
          "Donne-moi un court message de motivation pour la course à pied en français.",
      },
    ],
    max_tokens: 60,
  };

  const res = await fetch(MISTRAL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch motivation");
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  return text.trim();
};
