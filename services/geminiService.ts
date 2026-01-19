
import { GoogleGenAI } from "@google/genai";

// Ensure API_KEY is available. In a real app, this should be handled securely.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  // In a real scenario, you might want to show an error to the user or disable functionality.
  console.error("Gemini API key not found. Please set the API_KEY environment variable.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function detectLanguage(sampleText: string): Promise<string> {
  if (!API_KEY) return "English"; // Default or error handling
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `What is the main language of this text? Respond with only the name of the language (e.g., 'English', 'Spanish', 'French'). Text: "${sampleText}"`,
    });
    
    const language = response.text.trim();
    // Basic validation to ensure a reasonable response
    if (language && language.length < 30) {
      return language;
    }
    return "English"; // Fallback
  } catch (error) {
    console.error("Error detecting language:", error);
    return "English"; // Fallback on error
  }
}

export async function getDefinition(word: string, language: string): Promise<string> {
   if (!API_KEY) return "API key not configured.";
  try {
    const prompt = `In ${language}, what is a concise, simple definition for the word "${word}"? The definition must be easy for a language learner to understand. Respond with only the definition itself, in plain text, without any introductory phrases or markdown formatting like asterisks.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    // Clean the response to remove any lingering formatting
    return response.text.trim().replace(/\*/g, '');
  } catch (error) {
    console.error("Error getting definition:", error);
    throw new Error(`Failed to get definition for "${word}".`);
  }
}
