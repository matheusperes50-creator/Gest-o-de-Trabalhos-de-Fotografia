
import { GoogleGenAI, Type } from "@google/genai";
import { AIAdvice, ShootType } from "../types";

export const generateShootAdvice = async (clientName: string, shootType: ShootType): Promise<AIAdvice> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Gere ideias de marketing e checklist para um ensaio fotográfico do tipo "${shootType}" para o cliente "${clientName}".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          instagramCaption: {
            type: Type.STRING,
            description: "Uma legenda criativa e engajadora para o Instagram em português.",
          },
          reelIdeas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Três ideias de vídeos curtos (Reels/TikTok) para promover o trabalho.",
          },
          checklist: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Um checklist de 5 itens essenciais específicos para este tipo de ensaio.",
          }
        },
        required: ["instagramCaption", "reelIdeas", "checklist"],
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{}');
    return data as AIAdvice;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Erro ao gerar sugestões da IA.");
  }
};
