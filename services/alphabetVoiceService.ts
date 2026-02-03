
import { GoogleGenAI, Modality } from "@google/genai";
import { Language } from "../types";

const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

export class AlphabetVoiceService {
  private audioContext: AudioContext | null = null;
  private cache: Map<string, AudioBuffer> = new Map();

  private async getAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    return this.audioContext;
  }

  async speak(text: string, language: Language) {
    const cacheKey = `${language}:${text}`;
    if (this.cache.has(cacheKey)) {
      this.playBuffer(this.cache.get(cacheKey)!);
      return;
    }

    try {
      // Create fresh instance per call to ensure correct API key usage
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      let voiceName = 'Kore';
      let systemPrompt = `You are a helpful preschool teacher. Say the following in a clear, slow, and encouraging tone. Use a professional accent for ${language}.`;
      
      // Language-specific voice optimization
      if (language === 'Arabic') voiceName = 'Puck';
      else if (language === 'Pashto') voiceName = 'Zephyr';
      else if (language === 'Urdu') voiceName = 'Charon';
      else if (language === 'Italian') voiceName = 'Fenrir';

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Language: ${language}. Text to speak: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
          systemInstruction: systemPrompt
        },
      });

      const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data);
      const base64Audio = audioPart?.inlineData?.data;

      if (!base64Audio) throw new Error("No audio data found");

      const ctx = await this.getAudioContext();
      const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);

      this.cache.set(cacheKey, audioBuffer);
      this.playBuffer(audioBuffer);
    } catch (error) {
      console.error("TTS Error:", error);
    }
  }

  private async playBuffer(buffer: AudioBuffer) {
    const ctx = await this.getAudioContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  }
}

export const alphabetVoiceService = new AlphabetVoiceService();
