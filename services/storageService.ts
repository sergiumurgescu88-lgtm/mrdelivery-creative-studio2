import { CampaignState, Draft } from "../types";

const DRAFTS_KEY = "mrdelivery_drafts";

// Helper to convert Blob URL to Base64 for storage
const blobUrlToBase64 = async (blobUrl: string): Promise<string> => {
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("Failed to convert blob to base64", e);
    return blobUrl; // Return original if fail, though it won't persist
  }
};

export const saveDraft = async (objective: string, campaignState: CampaignState): Promise<void> => {
  const drafts = getDrafts();
  
  // Deep copy to modify videoUrl for storage without affecting current state
  const stateToSave = JSON.parse(JSON.stringify(campaignState));

  // If videoUrl is a blob (from Veo generation), try to convert to Base64
  // Note: LocalStorage has size limits (usually 5MB). 
  // If video is too big, we save the rest and skip the video.
  if (stateToSave.assets.videoUrl && stateToSave.assets.videoUrl.startsWith('blob:')) {
    try {
      const base64Video = await blobUrlToBase64(stateToSave.assets.videoUrl);
      stateToSave.assets.videoUrl = base64Video;
    } catch (e) {
      console.warn("Could not process video for storage", e);
    }
  }

  const newDraft: Draft = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    objective,
    campaignState: stateToSave
  };

  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify([newDraft, ...drafts]));
  } catch (e) {
    // If quota exceeded, try removing the video data and saving just the strategy/text
    if (stateToSave.assets.videoUrl && stateToSave.assets.videoUrl.length > 1000) {
      console.warn("Storage quota exceeded. Saving without video asset.");
      stateToSave.assets.videoUrl = null; 
      // Re-create draft without video
      const fallbackDraft = { ...newDraft, campaignState: stateToSave };
      localStorage.setItem(DRAFTS_KEY, JSON.stringify([fallbackDraft, ...drafts]));
    } else {
      throw e;
    }
  }
};

export const getDrafts = (): Draft[] => {
  try {
    const stored = localStorage.getItem(DRAFTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load drafts", e);
    return [];
  }
};

export const deleteDraft = (id: string): Draft[] => {
  const drafts = getDrafts().filter(d => d.id !== id);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  return drafts;
};
