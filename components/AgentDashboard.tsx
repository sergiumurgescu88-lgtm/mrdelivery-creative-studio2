import React from 'react';
import { AgentStatus, AgentRole } from '../types';
import { Bot, CheckCircle2, CircleDashed, Loader2, AlertCircle } from 'lucide-react';

interface AgentDashboardProps {
  agents: AgentStatus[];
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ agents }) => {
  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700 p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-6">
        <Bot className="text-blue-400" />
        <h3 className="text-lg font-semibold text-white">AI Agent Team Status</h3>
      </div>
      
      <div className="space-y-4">
        {agents.map((agent) => (
          <div key={agent.role} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center transition-colors
                ${agent.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                  agent.status === 'working' ? 'bg-blue-500/20 text-blue-400' : 
                  agent.status === 'error' ? 'bg-red-500/20 text-red-400' : 
                  'bg-slate-800 text-slate-600'}
              `}>
                {agent.status === 'completed' ? <CheckCircle2 size={16} /> :
                 agent.status === 'working' ? <Loader2 size={16} className="animate-spin" /> :
                 agent.status === 'error' ? <AlertCircle size={16} /> :
                 <CircleDashed size={16} />}
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-medium ${agent.status === 'idle' ? 'text-slate-500' : 'text-slate-200'}`}>
                  {agent.role}
                </span>
                <span className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                  {agent.message}
                </span>
              </div>
            </div>
            {agent.status === 'working' && (
              <div className="h-1 w-16 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-progress"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentDashboard;
