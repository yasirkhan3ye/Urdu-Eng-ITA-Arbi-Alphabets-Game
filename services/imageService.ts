
import { GoogleGenAI } from "@google/genai";

export type ImageSize = "1K" | "2K" | "4K";

export class ImageService {
  async generateAlphabetImage(prompt: string, size: ImageSize = "1K") {
    // Creating a fresh instance to ensure it uses the latest selected key if applicable
    // Fix: Use process.env.API_KEY directly as string
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            {
              text: `A vibrant, high-quality, child-friendly illustration for an educational game. The image shows: ${prompt}. Cute, 3D render style, bright colors, white background.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: size
          }
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image data found in response");
    } catch (error: any) {
      if (error.message?.includes("Requested entity was not found")) {
        throw new Error("API_KEY_NOT_FOUND");
      }
      throw error;
    }
  }
}

export const imageService = new ImageService();
