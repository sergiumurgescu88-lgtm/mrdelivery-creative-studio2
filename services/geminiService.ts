import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Platform, AgentRole } from "../types";

// Helper to get a fresh AI client instance
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const TEXT_MODEL = "gemini-3-pro-preview";
const KEYFRAME_MODEL = "gemini-2.5-flash-image"; // Nano Banana for Keyframes
const VIDEO_MODEL = "veo-3.1-fast-generate-preview";

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1]; 
        resolve(base64);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// --- Agent 1: Content Strategist ---
export async function runStrategist(objective: string): Promise<{ hook: string; concept: string; targetAudience: string; visualStyle: string }> {
  const prompt = `
    You are the Content Strategist for MrDelivery Studio, an AI marketing agency for Romanian restaurants.
    Client Objective: "${objective}"
    
    Devise a high-converting short-form video concept (9:16 vertical).
    Focus on: Problems real restaurants face, visible transformations, food appeal, or "behind the scenes".
    
    Output JSON:
    {
      "hook": "3-second hook text",
      "concept": "Brief description of the video narrative",
      "targetAudience": "Who is this for?",
      "visualStyle": "Cinematic, documentary, handheld, etc."
    }
  `;

  const result = await getAI().models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hook: { type: Type.STRING },
          concept: { type: Type.STRING },
          targetAudience: { type: Type.STRING },
          visualStyle: { type: Type.STRING }
        },
        required: ["hook", "concept", "targetAudience", "visualStyle"]
      }
    }
  });

  return JSON.parse(result.text || "{}");
}

// --- Agent 3: VEO Prompt Engineer ---
export async function runPromptEngineer(strategy: any): Promise<string> {
  const prompt = `
    You are the VEO 3 Prompt Engineer.
    Based on this strategy: ${JSON.stringify(strategy)}
    
    Write a highly detailed prompt for Google Veo 3 video generation.
    - Aspect Ratio: 9:16
    - Style: ${strategy.visualStyle}
    - Content: ${strategy.concept}
    - Lighting: Professional, appetizing.
    - Movement: Smooth, cinematic.
    
    Return ONLY the raw prompt string.
  `;
  
  const result = await getAI().models.generateContent({
    model: TEXT_MODEL,
    contents: prompt
  });
  
  return result.text || "";
}

// --- Agent 2: Keyframe Designer (Nano Banana) ---
export async function runKeyframeDesigner(veoPrompt: string): Promise<string> {
  try {
    // Generate the "First Frame" to ensure specific aesthetic
    const result = await getAI().models.generateContent({
      model: KEYFRAME_MODEL,
      contents: {
        parts: [{ text: `Generate a photorealistic vertical (9:16) first frame for a video about: ${veoPrompt}` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "9:16",
        }
      }
    });

    for (const part of result.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No keyframe generated");
  } catch (error) {
    console.error("Keyframe Designer Error:", error);
    throw error;
  }
}

// --- Agent 4: Production Manager (Veo 3) ---
export async function runProductionManager(veoPrompt: string, startFrameBase64: string): Promise<string> {
  try {
    // Strip prefix for API
    const imageBytes = startFrameBase64.split(',')[1];
    
    // IMPORTANT: Create new instance to ensure latest API key is used
    const ai = getAI();

    let operation = await ai.models.generateVideos({
      model: VIDEO_MODEL,
      prompt: veoPrompt,
      image: {
        imageBytes: imageBytes,
        mimeType: 'image/png'
      },
      config: {
        numberOfVideos: 1,
        aspectRatio: '9:16',
        resolution: '720p'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation failed");

    const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Production Manager Error:", error);
    throw error;
  }
}

// --- Agent 5: Caption Writer ---
export async function runCaptionWriter(strategy: any): Promise<Record<Platform, string>> {
  const prompt = `
    You are the Caption Writer for MrDelivery Studio.
    Strategy: ${JSON.stringify(strategy)}
    
    Write 3 distinct captions in Romanian (or English if context implies) for:
    1. TikTok (Short, trendy, hashtags)
    2. Instagram Reels (Aesthetic, engaging, medium length)
    3. YouTube Shorts (SEO optimized, clear description)
  `;

  const result = await getAI().models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          TikTok: { type: Type.STRING },
          InstagramReels: { type: Type.STRING },
          YouTubeShorts: { type: Type.STRING }
        },
        required: ["TikTok", "InstagramReels", "YouTubeShorts"]
      }
    }
  });

  return JSON.parse(result.text || "{}");
}

// --- Agent 7: Analytics Optimizer (Simulated) ---
export async function runAnalyticsOptimizer(): Promise<string> {
  // In a real app, this would fetch data. Here we simulate the Agent's insight.
  await new Promise(resolve => setTimeout(resolve, 1000));
  return "Predicted Engagement: High. The 'Problem/Solution' hook structure has a 20% higher retention rate for restaurant niches.";
}
