import React, { useState, useEffect } from 'react';
import { AgentRole, CampaignState, Platform, Draft } from './types';
import { 
  runStrategist, 
  runPromptEngineer, 
  runKeyframeDesigner, 
  runProductionManager, 
  runCaptionWriter,
  runAnalyticsOptimizer
} from './services/geminiService';
import { saveDraft, getDrafts } from './services/storageService';
import AgentDashboard from './components/AgentDashboard';
import PitchModal from './components/PitchModal';
import DraftsModal from './components/DraftsModal';
import { 
  Rocket, 
  Video, 
  Share2, 
  Play, 
  Target,
  UtensilsCrossed,
  CheckCircle,
  Info,
  CreditCard,
  Save,
  FolderOpen,
  Sparkles,
  Image as ImageIcon,
  FileText,
  Lock
} from 'lucide-react';

const INITIAL_AGENTS = [
  { role: AgentRole.Strategist, status: 'idle', message: 'Waiting for objective...' },
  { role: AgentRole.PromptEngineer, status: 'idle', message: 'Standing by...' },
  { role: AgentRole.Designer, status: 'idle', message: 'Nano Banana ready...' },
  { role: AgentRole.Producer, status: 'idle', message: 'Veo 3 ready...' },
  { role: AgentRole.Writer, status: 'idle', message: 'Ready to write...' },
  { role: AgentRole.Poster, status: 'idle', message: 'Blotato API connected...' },
  { role: AgentRole.Analyst, status: 'idle', message: 'Analytics engine ready...' },
  { role: AgentRole.Orchestrator, status: 'idle', message: 'System idle' },
] as const;

const App: React.FC = () => {
  const [objective, setObjective] = useState('');
  const [isPitchOpen, setIsPitchOpen] = useState(false);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [campaign, setCampaign] = useState<CampaignState>({
    isActive: false,
    agents: JSON.parse(JSON.stringify(INITIAL_AGENTS)),
    assets: { videoUrl: null, coverImageUrl: null, veoPrompt: null, captions: {} as any, strategy: null },
    error: null
  });

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeyReady(hasKey);
      } else {
        // Fallback for environments without the AI Studio wrapper
        setApiKeyReady(true);
      }
    };
    checkKey();
    
    // Load drafts initially
    setDrafts(getDrafts());
  }, []);

  const handleConnectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success to avoid race condition as per guidelines
      setApiKeyReady(true);
    }
  };

  const updateAgent = (role: AgentRole, status: 'idle' | 'working' | 'completed' | 'error', message: string) => {
    setCampaign(prev => ({
      ...prev,
      agents: prev.agents.map(a => a.role === role ? { ...a, status, message } : a)
    }));
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await saveDraft(objective, campaign);
      setDrafts(getDrafts()); // Refresh list
      alert("Campaign saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save draft. Storage might be full.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDraft = (draft: Draft) => {
    setObjective(draft.objective);
    setCampaign(draft.campaignState);
    setIsDraftsOpen(false);
  };

  const handleStartCampaign = async () => {
    if (!objective) return;
    
    setCampaign(prev => ({ ...prev, isActive: true, error: null }));
    
    try {
      // 0. Orchestrator Start
      updateAgent(AgentRole.Orchestrator, 'working', 'Initializing workflow...');
      
      // 1. Strategist
      updateAgent(AgentRole.Strategist, 'working', 'Analyzing market & defining hook...');
      const strategy = await runStrategist(objective);
      setCampaign(prev => ({ ...prev, assets: { ...prev.assets, strategy } }));
      updateAgent(AgentRole.Strategist, 'completed', 'Strategy defined: ' + strategy.hook);

      // 2. Prompt Engineer
      updateAgent(AgentRole.PromptEngineer, 'working', 'Optimizing Veo 3 prompts...');
      const veoPrompt = await runPromptEngineer(strategy);
      setCampaign(prev => ({ ...prev, assets: { ...prev.assets, veoPrompt } }));
      updateAgent(AgentRole.PromptEngineer, 'completed', 'Prompt generated');

      // 3. Keyframe Designer (Nano Banana)
      updateAgent(AgentRole.Designer, 'working', 'Generating cinematic start frame...');
      const startFrame = await runKeyframeDesigner(veoPrompt);
      setCampaign(prev => ({ ...prev, assets: { ...prev.assets, coverImageUrl: startFrame } }));
      updateAgent(AgentRole.Designer, 'completed', 'Keyframe rendered');

      // 4. Production Manager (Veo) - SKIPPED FOR NOW (Premium Step)
      updateAgent(AgentRole.Producer, 'idle', 'Waiting for premium activation...');

      // 5. Caption Writer
      updateAgent(AgentRole.Writer, 'working', 'Drafting platform-specific copy...');
      const captions = await runCaptionWriter(strategy);
      setCampaign(prev => ({ ...prev, assets: { ...prev.assets, captions } }));
      updateAgent(AgentRole.Writer, 'completed', 'Captions ready');

      // 6. Blotato Controller (Simulated)
      updateAgent(AgentRole.Poster, 'working', 'Scheduling posts via Blotato...');
      await new Promise(r => setTimeout(r, 1500)); // Sim delay
      updateAgent(AgentRole.Poster, 'completed', 'Scheduled for optimal times');

      // 7. Analyst
      updateAgent(AgentRole.Analyst, 'working', 'Predicting campaign performance...');
      const analysis = await runAnalyticsOptimizer();
      updateAgent(AgentRole.Analyst, 'completed', analysis);

      // Finish
      updateAgent(AgentRole.Orchestrator, 'completed', 'Pre-production complete. Ready for video.');

    } catch (e: any) {
      console.error(e);
      setCampaign(prev => ({ ...prev, error: (e as Error).message }));
      updateAgent(AgentRole.Orchestrator, 'error', 'Workflow failed');
    }
  };

  const handleGenerateVideo = async () => {
    if (!campaign.assets.veoPrompt || !campaign.assets.coverImageUrl) return;

    try {
      // 4. Production Manager (Veo) - ACTUAL GENERATION
      updateAgent(AgentRole.Producer, 'working', 'Veo 3 generating video (this takes a moment)...');
      updateAgent(AgentRole.Orchestrator, 'working', 'Finalizing Video Asset...');
      
      const videoUrl = await runProductionManager(campaign.assets.veoPrompt, campaign.assets.coverImageUrl);
      
      setCampaign(prev => ({ ...prev, assets: { ...prev.assets, videoUrl } }));
      updateAgent(AgentRole.Producer, 'completed', 'Video production finished');
      updateAgent(AgentRole.Orchestrator, 'completed', 'Campaign successfully generated');
    } catch (e: any) {
       console.error(e);
       setCampaign(prev => ({ ...prev, error: (e as Error).message }));
       updateAgent(AgentRole.Producer, 'error', 'Video generation failed');
       updateAgent(AgentRole.Orchestrator, 'error', 'Video generation failed');
       
       if (e.message?.includes("403") || e.message?.includes("Requested entity was not found")) {
         setApiKeyReady(false);
         if (window.aistudio) {
           updateAgent(AgentRole.Producer, 'error', 'Billing required.');
           await window.aistudio.openSelectKey();
           setApiKeyReady(true);
         }
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white font-inter selection:bg-orange-500/30">
      
      <PitchModal isOpen={isPitchOpen} onClose={() => setIsPitchOpen(false)} />
      
      <DraftsModal 
        isOpen={isDraftsOpen} 
        onClose={() => setIsDraftsOpen(false)} 
        drafts={drafts}
        onLoad={handleLoadDraft}
        onUpdateDrafts={setDrafts}
      />

      {/* Navbar */}
      <nav className="border-b border-white/5 bg-[#0f1115]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-lg">
              <UtensilsCrossed size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              MrDelivery <span className="text-orange-500">Studio</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDraftsOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors border border-slate-700"
            >
              <FolderOpen size={14} className="text-blue-400" />
              <span>My Drafts</span>
              <span className="bg-slate-700 px-1.5 rounded-md text-[10px]">{drafts.length}</span>
            </button>

            <button 
              onClick={() => setIsPitchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors border border-slate-700"
            >
              <Info size={14} className="text-orange-500" />
              <span>About System</span>
            </button>
            <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
            <span className="text-green-500 flex items-center gap-1 text-xs font-semibold uppercase tracking-widest hidden sm:flex">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              System Online
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input & Status */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Mission Control */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl relative">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Target className="text-orange-500" />
                  Campaign Objective
                </h2>
                {campaign.isActive && (
                   <button 
                     onClick={handleSaveDraft}
                     disabled={isSaving}
                     className="text-xs flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                   >
                     {isSaving ? (
                       <span className="animate-pulse">Saving...</span>
                     ) : (
                       <>
                        <Save size={14} />
                        Save Draft
                       </>
                     )}
                   </button>
                )}
              </div>
              
              <p className="text-slate-400 mb-6 text-sm">
                Define your goal (e.g., "Sell 100 burgers", "Promote Valentine's Offer"). The Orchestrator will activate the team.
              </p>
              
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="e.g., I want to generate 50 leads for my pizza delivery service in Bucharest this weekend..."
                className="w-full h-32 bg-black/30 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none mb-4 transition-all"
              />
              
              {!apiKeyReady ? (
                <button
                  onClick={handleConnectKey}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard size={20} />
                  Connect Billing Account (Required for Veo)
                </button>
              ) : (
                <button
                  onClick={handleStartCampaign}
                  disabled={!objective || (campaign.isActive && campaign.agents[7].status !== 'completed')}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {campaign.isActive && campaign.agents[7].status !== 'completed' && campaign.agents[3].status !== 'idle' ? (
                     <>Processing Workflow...</>
                  ) : (
                     <>
                       <Rocket size={20} />
                       {campaign.isActive ? 'Restart Campaign' : 'Activate 8-Agent Team'}
                     </>
                  )}
                </button>
              )}
              {campaign.error && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                   {campaign.error}
                </div>
              )}
            </div>

            {/* Agent Status */}
            <AgentDashboard agents={campaign.agents} />
            
          </div>

          {/* Right Column: Results Preview */}
          <div className="lg:col-span-7 space-y-6">
            {campaign.assets.videoUrl ? (
              // FULL VIDEO VIEW
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                  {/* Video Player Header */}
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-black/20">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Video size={18} className="text-orange-500" />
                      Generated Master Asset
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-slate-500 font-mono">VEO 3 • 720p • 9:16</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2">
                     {/* Player */}
                     <div className="aspect-[9/16] bg-black relative group">
                        <video 
                          key={campaign.assets.videoUrl} 
                          src={campaign.assets.videoUrl} 
                          poster={campaign.assets.coverImageUrl || undefined}
                          className="w-full h-full object-cover"
                          controls
                          autoPlay
                          loop
                        />
                     </div>
                     
                     {/* Details & Captions */}
                     <div className="p-6 flex flex-col gap-6 max-h-[600px] overflow-y-auto">
                        <div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Strategy</span>
                          <h4 className="text-lg font-bold text-white mt-1">{campaign.assets.strategy?.hook}</h4>
                          <p className="text-sm text-slate-400 mt-2">{campaign.assets.strategy?.concept}</p>
                        </div>
                         {/* Captions Display (Shared Component Logic) */}
                        <div className="space-y-4">
                           <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Adaptations</span>
                           {[
                             { platform: Platform.TikTok, color: 'text-pink-400' },
                             { platform: Platform.InstagramReels, color: 'text-purple-400' },
                             { platform: Platform.YouTubeShorts, color: 'text-red-400' }
                           ].map(({platform, color}) => (
                             <div key={platform} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <div className={`flex items-center gap-2 mb-2 ${color}`}>
                                  <span className="font-bold text-sm">{platform}</span>
                                </div>
                                <p className="text-sm text-slate-300 font-light">{campaign.assets.captions[platform]}</p>
                             </div>
                           ))}
                        </div>
                        
                        <div className="mt-auto pt-4 border-t border-slate-800 flex gap-2">
                           <button className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                             <CheckCircle size={16} />
                             Approve & Post
                           </button>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            ) : campaign.assets.coverImageUrl ? (
              // PRE-PRODUCTION VIEW (Image + Prompts)
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
                
                {/* Generated Prompt Section */}
                {campaign.assets.veoPrompt && (
                   <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
                      <div className="flex items-center gap-2 mb-3 text-purple-400">
                        <Sparkles size={18} />
                        <h3 className="font-bold text-sm uppercase tracking-wide">AI Generated Prompt & Strategy</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="bg-black/30 p-4 rounded-xl border border-slate-700">
                           <div className="text-xs text-slate-500 font-mono mb-2">STRATEGY HOOK</div>
                           <p className="text-white text-lg font-medium">{campaign.assets.strategy?.hook}</p>
                           <p className="text-slate-400 text-sm mt-2">{campaign.assets.strategy?.concept}</p>
                         </div>
                         <div className="bg-black/30 p-4 rounded-xl border border-slate-700">
                           <div className="text-xs text-slate-500 font-mono mb-2">VEO 3 PROMPT</div>
                           <p className="text-slate-300 text-xs leading-relaxed font-mono">{campaign.assets.veoPrompt}</p>
                         </div>
                      </div>
                   </div>
                )}

                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-black/20">
                    <h3 className="font-semibold flex items-center gap-2">
                      <ImageIcon size={18} className="text-blue-500" />
                      Production Preview
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-slate-500 font-mono">Nano Banana • Start Frame</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Image Preview */}
                    <div className="aspect-[9/16] bg-black relative">
                      <img 
                        src={campaign.assets.coverImageUrl} 
                        alt="Start Frame" 
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                         <button 
                           onClick={handleGenerateVideo}
                           className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 px-6 rounded-xl shadow-2xl shadow-orange-900/50 flex items-center gap-2 transform hover:scale-105 transition-all border border-orange-400/30"
                         >
                           <Lock size={16} />
                           Generate Video (Premium)
                         </button>
                      </div>
                    </div>

                    {/* Pending Details */}
                    <div className="p-6 flex flex-col gap-6 max-h-[600px] overflow-y-auto opacity-50 pointer-events-none grayscale">
                        <div className="text-center py-10">
                           <p className="text-slate-400 text-sm">Draft captions generated below will be active after video generation.</p>
                        </div>
                        {/* Preview of Captions (Disabled look) */}
                        <div className="space-y-4">
                           <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Adaptations</span>
                           {[Platform.TikTok, Platform.InstagramReels, Platform.YouTubeShorts].map((p) => (
                             <div key={p} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <div className="h-4 w-20 bg-slate-700 rounded mb-2"></div>
                                <div className="space-y-2">
                                  <div className="h-3 w-full bg-slate-700/50 rounded"></div>
                                  <div className="h-3 w-3/4 bg-slate-700/50 rounded"></div>
                                </div>
                             </div>
                           ))}
                        </div>
                    </div>
                  </div>
                </div>

                 {/* Active Captions Preview (Bottom) */}
                 {campaign.assets.captions[Platform.TikTok] && (
                   <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
                      <div className="flex items-center gap-2 mb-4 text-green-400">
                        <FileText size={18} />
                        <h3 className="font-bold text-sm uppercase tracking-wide">Generated Draft Copy</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         {[
                             { platform: Platform.TikTok, color: 'text-pink-400' },
                             { platform: Platform.InstagramReels, color: 'text-purple-400' },
                             { platform: Platform.YouTubeShorts, color: 'text-red-400' }
                           ].map(({platform, color}) => (
                             <div key={platform} className="bg-black/20 p-4 rounded-xl border border-slate-700/50">
                                <div className={`text-xs font-bold mb-2 ${color}`}>{platform}</div>
                                <p className="text-slate-300 text-xs leading-relaxed">{campaign.assets.captions[platform]}</p>
                             </div>
                           ))}
                      </div>
                   </div>
                 )}

              </div>
            ) : (
              // EMPTY STATE
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-800">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Play className="text-slate-600 ml-1" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">Ready for Production</h3>
                <p className="text-slate-500 max-w-md">
                  Activate the Master Orchestrator to begin the AI marketing workflow. 
                  We will generate strategy, prompts, and images first. Video is a premium step.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;