import React, { useState } from 'react';
import { 
  Settings, Bot, HelpCircle, Terminal, Send, Play, Sparkles, CheckCircle, 
  Trash2, RefreshCw, Layers, ShieldAlert, BarChart3, Database
} from 'lucide-react';
import { InternalAgentConfig, Lead, MarketingCampaign, CustomerReview } from '../types';

interface AdminPortalProps {
  configs: InternalAgentConfig[];
  onUpdateConfig: (config: InternalAgentConfig) => void;
  leads: Lead[];
  campaigns: MarketingCampaign[];
  reviews: CustomerReview[];
}

export default function AdminPortal({
  configs,
  onUpdateConfig,
  leads,
  campaigns,
  reviews
}: AdminPortalProps) {
  // Config selection
  const [selectedConfigId, setSelectedConfigId] = useState<string>(configs[0]?.id || '');
  const activeConfig = configs.find(c => c.id === selectedConfigId);

  // Copilot questions
  const [copilotQuestion, setCopilotQuestion] = useState('What caused booking declines in April?');
  const [copilotResponse, setCopilotResponse] = useState<string>('');
  const [copilotLoading, setCopilotLoading] = useState(false);

  // Suggested questions
  const suggestions = [
    "What caused booking declines in April?",
    "Which marketing channels generate the highest ROI yield?",
    "Review our current traveler feedback sentiments. What issues need operations attention?"
  ];

  const handleUpdateConfigValue = (key: keyof InternalAgentConfig, value: any) => {
    if (!activeConfig) return;
    const updated = {
      ...activeConfig,
      [key]: value
    };
    onUpdateConfig(updated);
  };

  // Run natural language executive queries using Server-side Gemini API
  const handleQueryCopilot = async (selectedQuestion?: string) => {
    const questionToAsk = selectedQuestion || copilotQuestion;
    if (!questionToAsk.trim()) return;

    setCopilotLoading(true);
    setCopilotResponse('');

    // Package operational datasets for rich state context
    const datasetSummary = {
      leadsStats: {
        totalLeadsCount: leads.length,
        statusBreakdown: {
          New: leads.filter(l => l.status === 'New').length,
          Qualified: leads.filter(l => l.status === 'Qualified').length,
          InProgress: leads.filter(l => l.status === 'In Progress').length,
          Booked: leads.filter(l => l.status === 'Booked').length,
          Lost: leads.filter(l => l.status === 'Lost').length
        },
        maxRequestedBudget: Math.max(...leads.map(l => l.budget), 10000)
      },
      marketingIntelligence: campaigns.map(c => ({
        name: c.name,
        channel: c.channel,
        spend: c.spend,
        revenue: c.revenue,
        roi: c.roi
      })),
      reviewsReputationSentiment: {
        totalReviewsCount: reviews.length,
        sentimentCounts: {
          positive: reviews.filter(r => r.sentiment === 'positive').length,
          neutral: reviews.filter(r => r.sentiment === 'neutral').length,
          negative: reviews.filter(r => r.sentiment === 'negative').length
        }
      }
    };

    try {
      const response = await fetch('/api/gemini/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionToAsk,
          databaseSummary: datasetSummary
        })
      });
      const data = await response.json();
      setCopilotResponse(data.text || "I apologize, the analyst had trouble organizing the requested numbers.");
    } catch (err) {
      console.error(err);
      setCopilotResponse("Executive network copilot query failed. Please inspect console logging or ensure model key is correctly bound.");
    } finally {
      setCopilotLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12" id="admin-portal-workspace">
      
      {/* AGENTS CONFIGURATION CONSOLE (Temperature, parameters, instructions) */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Autonomous Agents Config
            <span className="text-xs bg-indigo-100 text-indigo-800 py-0.5 px-2 rounded-full font-medium">B2B Core</span>
          </h2>
          <p className="text-xs text-slate-500">Override system-level system instruction rules, response creativity, and models for TravelGPT internal staff agents</p>
        </div>

        {/* Selected config tab selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Select B2B AI Assistant Staff</label>
          <div className="grid grid-cols-2 gap-2">
            {configs.map((conf) => (
              <button
                key={conf.id}
                onClick={() => setSelectedConfigId(conf.id)}
                className={`p-2.5 rounded-lg border text-xs text-left truncate transition-all cursor-pointer ${
                  selectedConfigId === conf.id 
                    ? 'border-indigo-600 bg-indigo-50/20 ring-1 ring-indigo-500 font-bold text-slate-900' 
                    : 'border-slate-200 hover:border-slate-350 bg-slate-50/50 text-slate-700 font-medium'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Bot className={`w-3.5 h-3.5 shrink-0 ${selectedConfigId === conf.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="truncate">{conf.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Config editor parameters */}
        {activeConfig && (
          <div className="p-4 bg-slate-50/70 border border-slate-150 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs bg-indigo-100 text-indigo-800 py-0.5 px-2 rounded-sm font-bold font-mono uppercase">{activeConfig.id}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeConfig.status === 'Active' 
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                  : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}>
                ● {activeConfig.status}
              </span>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agent Role Target Description</label>
              <p className="text-xs font-semibold text-slate-800">{activeConfig.role}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Model Choice</label>
                <select
                  value={activeConfig.model}
                  onChange={(e) => handleUpdateConfigValue('model', e.target.value)}
                  className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-md outline-indigo-500"
                >
                  <option value="gemini-3.5-flash">gemini-3.5-flash (Standard)</option>
                  <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Advanced)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Cost-friendly)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Temperature ({activeConfig.temperature})</label>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.1"
                  value={activeConfig.temperature}
                  onChange={(e) => handleUpdateConfigValue('temperature', Number(e.target.value))}
                  className="w-full accent-indigo-600 mt-2 cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Instruction Guidelines</label>
              <textarea
                rows={5}
                value={activeConfig.systemInstruction}
                onChange={(e) => handleUpdateConfigValue('systemInstruction', e.target.value)}
                className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg text-slate-700 outline-indigo-500 font-mono leading-relaxed"
              />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-150/50">
              <button
                onClick={() => {
                  handleUpdateConfigValue('status', activeConfig.status === 'Active' ? 'Inactive' : 'Active');
                }}
                className={`py-1 px-3 text-xs font-bold rounded-lg ${
                  activeConfig.status === 'Active' ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {activeConfig.status === 'Active' ? 'Deactivate AI Agent' : 'Activate AI Agent'}
              </button>
              <button
                onClick={() => alert(`System-level prompts successfully synchronized and stored inside dynamic schema.`)}
                className="py-1 px-3 bg-slate-900 text-white hover:bg-black text-xs font-bold rounded-lg cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* EXECUTIVE COPILOT TERMINAL */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Executive Copilot Terminal</h3>
                <p className="text-xs text-slate-500">Query your entire relational business data indexes with natural language inquiries</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[10px] bg-slate-50 border border-slate-150 py-1 px-2.5 rounded-md font-mono font-bold text-slate-600 uppercase tracking-wider">
              <Database className="w-3 h-3 text-emerald-500" /> Database Live Synchronized
            </span>
          </div>

          {/* Prompt inputs and suggestions */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCopilotQuestion(sug);
                    handleQueryCopilot(sug);
                  }}
                  className="py-1 px-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-650 text-[10px] rounded-lg font-semibold tracking-wide transition-all cursor-pointer text-left block max-w-full truncate"
                >
                  {sug}
                </button>
              ))}
            </div>

            <div className="relative">
              <input 
                type="text" 
                value={copilotQuestion} 
                onChange={(e) => setCopilotQuestion(e.target.value)} 
                placeholder="Ask about declines, campaign channels, customer feedback analysis..." 
                className="w-full pl-3 pr-24 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 hover:bg-slate-100/50" 
              />
              <button
                onClick={() => handleQueryCopilot()}
                disabled={copilotLoading}
                className="absolute right-1.5 top-1.5 py-1 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-[10px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copilotLoading ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                    <span>Query Copilot</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Response output terminal */}
          <div className="bg-slate-950 font-mono text-xs rounded-xl p-4 min-h-[220px] max-h-[380px] overflow-y-auto border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-800/80 pb-2">
              <span>travelgpt_operational_analytics_matrix.log</span>
              <span>UTC {new Date().toISOString().slice(0, 19).replace('T', ' ')}</span>
            </div>

            {copilotResponse ? (
              <div className="text-amber-400 font-sans space-y-2.5 leading-relaxed leading-6 whitespace-pre-wrap selection:bg-amber-800 selection:text-white">
                {copilotResponse}
              </div>
            ) : copilotLoading ? (
              <div className="flex items-center gap-2 pt-6 text-slate-400">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Running analytical vector queries across marketing and customer sentiment tables...</span>
              </div>
            ) : (
              <div className="text-slate-500 flex flex-col justify-center items-center h-40 space-y-2">
                <Bot className="w-8 h-8 text-slate-750" />
                <p className="text-[10px] font-bold text-center uppercase tracking-wider">Corporate terminal idle. Enter question or click preloaded suggestion vectors above.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-[10.5px] text-amber-700 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <p>Admins hold global privileges. Adjusting instructions or thresholds will automatically impact the respective customer and hospitality advisor environments immediately.</p>
        </div>

      </div>

    </div>
  );
}
