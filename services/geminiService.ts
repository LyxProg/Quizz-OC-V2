
import { GoogleGenAI, Type } from "@google/genai";
import { UserResponse } from "../types";

export const generateRecommendation = async (responses: UserResponse[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    En tant qu'expert opticien, analyse les réponses de ce client pour lui recommander les meilleurs types de verres et traitements.
    Voici ses réponses :
    ${responses.map(r => `- ${r.questionText} : ${r.answerLabel}`).join('\n')}

    Propose une recommandation structurée avec un titre pro, une explication pédagogique et 3-4 points clés.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            explanation: { type: Type.STRING },
            keyFeatures: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "explanation", "keyFeatures"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      title: "Recommandation Personnalisée",
      explanation: "Basé sur vos réponses, nous recommandons une solution polyvalente pour votre confort visuel quotidien.",
      keyFeatures: ["Anti-reflets haute performance", "Protection UV renforcée", "Géométrie optimisée"]
    };
  }
};
