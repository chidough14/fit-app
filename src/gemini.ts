import { GoogleGenAI } from '@google/genai';
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY

if (!apiKey) {
  throw new Error('Gemini API key is missing. Check EXPO_PUBLIC_GEMINI_API_KEY in app.config.js');
}

// Create the Gemini AI client
const genAI = new GoogleGenAI({ apiKey });

export async function getGeminiResponse(prompt: string): Promise<string> {

  const result = await genAI.models.generateContent({
    model: 'gemini-2.5-pro', // ✅ Safe for old SDKs
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
  });

  const text = result.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
  return text.trim();
}