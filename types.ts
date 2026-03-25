export enum Platform {
  TikTok = 'TikTok',
  InstagramReels = 'Instagram Reels',
  YouTubeShorts = 'YouTube Shorts'
}

export enum AgentRole {
  Orchestrator = 'Master Orchestrator',
  Strategist = 'Content Strategist',
  Designer = 'Keyframe Designer',
  PromptEngineer = 'VEO 3 Prompt Engineer',
  Producer = 'Production Manager',
  Writer = 'Caption Writer',
  Poster = 'Blotato Controller',
  Analyst = 'Analytics Optimizer'
}

export interface AgentStatus {
  role: AgentRole;
  status: 'idle' | 'working' | 'completed' | 'error';
  message: string;
}

export interface CampaignAsset {
  videoUrl: string | null;
  coverImageUrl: string | null;
  veoPrompt: string | null;
  captions: Record<Platform, string>;
  strategy: {
    hook: string;
    concept: string;
    targetAudience: string;
  } | null;
}

export interface CampaignState {
  isActive: boolean;
  agents: AgentStatus[];
  assets: CampaignAsset;
  error: string | null;
}

export interface Draft {
  id: string;
  timestamp: number;
  objective: string;
  campaignState: CampaignState;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}