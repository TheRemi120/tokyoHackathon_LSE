export async function generateCoachReply(message: string): Promise<string> {
  const API_URL = 'https://api-inference.huggingface.co/models/huggingSmile/model';
  const token = import.meta.env.VITE_HUGGING_SMILE_API_KEY;

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ inputs: message }),
  });

  if (!res.ok) {
    throw new Error(`HuggingSmile API error ${res.status}`);
  }

  const data = await res.json();
  if (Array.isArray(data)) {
    return data[0]?.generated_text ?? '';
  }
  return data.generated_text ?? '';
}
