import React from 'react';
import { X, Trash2, Upload, Calendar, FileVideo } from 'lucide-react';
import { Draft } from '../types';
import { deleteDraft } from '../services/storageService';

interface DraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: Draft[];
  onLoad: (draft: Draft) => void;
  onUpdateDrafts: (drafts: Draft[]) => void;
}

const DraftsModal: React.FC<DraftsModalProps> = ({ isOpen, onClose, drafts, onLoad, onUpdateDrafts }) => {
  if (!isOpen) return null;

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = deleteDraft(id);
    onUpdateDrafts(updated);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f1115] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl relative flex flex-col">
        
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar size={20} className="text-orange-500" />
            Saved Campaigns
          </h3>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {drafts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileVideo size={32} className="opacity-50" />
              </div>
              <p>No saved drafts found.</p>
              <p className="text-xs mt-2">Generate a campaign and click "Save Draft" to see it here.</p>
            </div>
          ) : (
            drafts.map((draft) => (
              <div 
                key={draft.id}
                onClick={() => onLoad(draft)}
                className="bg-slate-800/30 border border-slate-700 hover:border-orange-500/50 rounded-xl p-4 cursor-pointer transition-all hover:bg-slate-800/50 group"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-500 font-mono">
                        {new Date(draft.timestamp).toLocaleDateString()} • {new Date(draft.timestamp).toLocaleTimeString()}
                      </span>
                      {draft.campaignState.assets.videoUrl && (
                        <span className="px-1.5 py-0.5 rounded bg-green-900/30 text-green-400 text-[10px] font-bold border border-green-500/20">
                          HAS VIDEO
                        </span>
                      )}
                    </div>
                    <p className="text-white font-medium truncate">
                      {draft.objective || "Untitled Campaign"}
                    </p>
                    <p className="text-sm text-slate-400 truncate mt-1">
                      {draft.campaignState.assets.strategy?.hook || "Strategy Pending..."}
                    </p>
                  </div>
                  
                  <button 
                    onClick={(e) => handleDelete(e, draft.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Draft"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {drafts.length > 0 && (
           <div className="p-4 bg-slate-900/50 border-t border-slate-800 text-center text-xs text-slate-500">
             Drafts are stored locally in your browser.
           </div>
        )}
      </div>
    </div>
  );
};

export default DraftsModal;
