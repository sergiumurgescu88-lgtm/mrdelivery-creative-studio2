import React from 'react';
import { X, AlertTriangle, Lightbulb, Zap, Cpu, Target, TrendingUp, Info } from 'lucide-react';

interface PitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PitchModal: React.FC<PitchModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f1115] border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 space-y-12">
          
          {/* Header */}
          <div className="text-center space-y-4 pt-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              MrDelivery <span className="text-orange-500">Studio</span>
            </h2>
            <div className="flex items-center justify-center gap-2 text-slate-400">
                <span className="uppercase tracking-widest text-xs font-semibold">One-Page Pitch</span>
                <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                <span className="text-lg font-light">The AI Video Marketing Department</span>
            </div>
          </div>

          {/* Grid Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Problem */}
            <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <AlertTriangle size={100} />
              </div>
              <div className="flex items-center gap-3 mb-6 text-red-400 relative z-10">
                <AlertTriangle size={24} />
                <h3 className="text-xl font-bold uppercase tracking-wide">The Problem</h3>
              </div>
              <ul className="space-y-3 text-slate-300 relative z-10">
                <li className="flex gap-2"><span className="text-red-500">•</span> No time for marketing</li>
                <li className="flex gap-2"><span className="text-red-500">•</span> Lack of video production skills</li>
                <li className="flex gap-2"><span className="text-red-500">•</span> Inconsistent, chaotic posting</li>
                <li className="flex gap-2"><span className="text-red-500">•</span> Losing customers to digital-first competitors</li>
                <li className="flex gap-2"><span className="text-red-500">•</span> Dependence on delivery apps without own brand</li>
              </ul>
            </div>

            {/* Solution */}
            <div className="bg-green-500/5 border border-green-500/20 p-8 rounded-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Lightbulb size={100} />
              </div>
              <div className="flex items-center gap-3 mb-6 text-green-400 relative z-10">
                <Lightbulb size={24} />
                <h3 className="text-xl font-bold uppercase tracking-wide">The Solution</h3>
              </div>
              <p className="text-slate-300 mb-6 text-lg leading-relaxed relative z-10">
                A fully automated AI system acting as your complete marketing department. It creates, produces, posts, and optimizes.
              </p>
              <div className="flex flex-wrap gap-2 relative z-10">
                {['AI Strategy', 'VEO 3 Video', 'Copywriting', 'Auto-Posting', 'Conversion Analytics'].map(tag => (
                  <span key={tag} className="bg-green-500/10 text-green-300 px-3 py-1.5 rounded-lg text-xs font-medium border border-green-500/30">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* How it Works */}
          <div className="bg-slate-800/30 p-8 rounded-2xl border border-slate-700/50">
             <div className="flex items-center gap-3 mb-8 text-blue-400">
                <Zap size={24} />
                <h3 className="text-xl font-bold uppercase tracking-wide">How It Works</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[
                   { step: 1, title: 'Plan Strategy', desc: 'Auto-generates 30-day content calendar' },
                   { step: 2, title: 'Generate Video', desc: 'Creates realistic assets with VEO 3' },
                   { step: 3, title: 'Write Copy', desc: 'Optimized specifically for TikTok, IG, YT' },
                   { step: 4, title: 'Auto-Post', desc: 'Publishes via API at optimal times' },
                   { step: 5, title: 'Monitor', desc: 'Tracks real performance metrics' },
                   { step: 6, title: 'Optimize', desc: 'Improves strategy based on data' },
                 ].map((item) => (
                   <div key={item.step} className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-colors">
                      <div className="text-orange-500 font-black text-2xl mb-2 opacity-50">0{item.step}</div>
                      <div className="font-bold text-white text-lg mb-1">{item.title}</div>
                      <div className="text-sm text-slate-500 leading-snug">{item.desc}</div>
                   </div>
                 ))}
              </div>
          </div>

          {/* Tech & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50">
              <div className="flex items-center gap-2 mb-4 text-purple-400">
                <Cpu size={20} />
                <h4 className="font-bold uppercase text-sm tracking-wider">Technology Stack</h4>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Gemini 1.5 Pro (Strategy), Veo 3 (Video Generation), Nano Banana (Consistency), Blotato API (Distribution).
              </p>
            </div>
             <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50">
              <div className="flex items-center gap-2 mb-4 text-orange-400">
                <Target size={20} />
                <h4 className="font-bold uppercase text-sm tracking-wider">Target Audience</h4>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Independent restaurants, small chains, and ghost kitchens in Eastern Europe seeking growth without headcount.
              </p>
            </div>
             <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50">
              <div className="flex items-center gap-2 mb-4 text-blue-400">
                <TrendingUp size={20} />
                <h4 className="font-bold uppercase text-sm tracking-wider">Vision</h4>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                To become the AI marketing infrastructure for restaurants, delivering real leads and orders, not just vanity metrics.
              </p>
            </div>
          </div>

          {/* Footer Quote */}
          <div className="text-center pt-8 border-t border-slate-800">
             <p className="text-slate-500 italic max-w-2xl mx-auto">
               "MrDelivery Studio combines AI Studio, a Marketing Agency, and Automation Software into one autonomous system."
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PitchModal;