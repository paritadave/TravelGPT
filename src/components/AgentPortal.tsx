import React, { useState } from 'react';
import { 
  Users, Mail, Phone, DollarSign, MapPin, Calendar, PlusCircle, Check, 
  Send, Bot, AlertCircle, ShoppingBag, Eye, Edit3, ArrowRight, Save,
  Download, Globe, Compass, Bell, Clock, Volume2, X, Trash2
} from 'lucide-react';
import { Lead, Itinerary } from '../types';

interface AgentPortalProps {
  leads: Lead[];
  onAddLead: (lead: Lead) => void;
  onUpdateLeadStatus: (leadId: string, newStatus: Lead['status']) => void;
  onUpdateLeadAgent?: (leadId: string, newAgent: string) => void;
  activeItinerary: Itinerary | null;
  onUpdateItinerary: (itinerary: Itinerary) => void;
}

export default function AgentPortal({
  leads,
  onAddLead,
  onUpdateLeadStatus,
  onUpdateLeadAgent,
  activeItinerary,
  onUpdateItinerary
}: AgentPortalProps) {
  // New Lead form inputs
  const [showAddLead, setShowAddLead] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBudget, setNewBudget] = useState('6000');
  const [newDestinations, setNewDestinations] = useState('Italy and Switzerland');
  const [newNotes, setNewNotes] = useState('');

  // Selected Lead to view details
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(leads[0]?.id || null);
  const activeLead = leads.find(l => l.id === selectedLeadId);

  // Custom agent markup multiplier
  const [markupPercent, setMarkupPercent] = useState(15);
  // Custom manual note added by travel agent to customer's package
  const [agentManualNote, setAgentManualNote] = useState('Premium Airport pick-up in executive limousine is pre-cleared for your comfort.');

  // Reminders State
  interface LeadReminder {
    id: string;
    leadId: string;
    customerName: string;
    triggerAt: number; // Unix timestamp in ms
    notes: string;
    triggered: boolean;
  }

  interface ToastMessage {
    id: string;
    title: string;
    message: string;
    type: 'reminder' | 'success' | 'info';
    leadId?: string;
  }

  const [reminders, setReminders] = useState<LeadReminder[]>(() => {
    try {
      const stored = localStorage.getItem('travelgpt_reminders');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showRemindersPanel, setShowRemindersPanel] = useState(false);

  // Selected lead target for setting a reminder
  const [reminderTargetLeadId, setReminderTargetLeadId] = useState<string | null>(null);
  const [reminderOffset, setReminderOffset] = useState<'10s' | '1m' | '5m' | '15m' | '1h' | 'custom'>('10s');
  const [reminderCustomTime, setReminderCustomTime] = useState('');
  const [reminderNotes, setReminderNotes] = useState('');

  // Persist reminders to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('travelgpt_reminders', JSON.stringify(reminders));
    } catch (e) {
      console.error("Failed to persist reminders", e);
    }
  }, [reminders]);

  // Handle reminder triggers
  const triggerReminderNotification = (rem: LeadReminder) => {
    // 1. Send native browser notification if supported and granted
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(`Lead Follow-up: ${rem.customerName}`, {
            body: rem.notes || `Time to follow up with ${rem.customerName}!`,
          });
        } catch (e) {
          console.error("Failed to show native notification", e);
        }
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }

    // 2. Add in-app toast notification with sound effects
    const toastId = `toast-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: ToastMessage = {
      id: toastId,
      title: `🔔 Follow-up Reminder: ${rem.customerName}`,
      message: rem.notes || `Scheduled follow-up is now due for this lead.`,
      type: 'reminder',
      leadId: rem.leadId
    };

    setToasts(prev => [newToast, ...prev]);

    // Play a gentle elegant chime sound using Web Audio API
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const playChime = (delay: number, freq: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
          gain.gain.setValueAtTime(0.12, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + 0.5);
        };
        playChime(0, 587.33); // D5
        playChime(0.12, 698.46); // F5
        playChime(0.24, 880.00); // A5
      }
    } catch (e) {
      console.warn("Audio Context chime not supported or allowed yet", e);
    }
  };

  // Periodic reminder checker
  React.useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();
      let updated = false;
      const newReminders = reminders.map(rem => {
        if (!rem.triggered && now >= rem.triggerAt) {
          triggerReminderNotification(rem);
          updated = true;
          return { ...rem, triggered: true };
        }
        return rem;
      });
      if (updated) {
        setReminders(newReminders);
      }
    };

    const intervalId = setInterval(checkReminders, 1000);
    return () => clearInterval(intervalId);
  }, [reminders]);

  const handleSetReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTargetLeadId) return;

    const leadObj = leads.find(l => l.id === reminderTargetLeadId);
    if (!leadObj) return;

    let delayMs = 10000; // default 10s for instant gratification!
    if (reminderOffset === '1m') delayMs = 60000;
    else if (reminderOffset === '5m') delayMs = 5 * 60000;
    else if (reminderOffset === '15m') delayMs = 15 * 60000;
    else if (reminderOffset === '1h') delayMs = 60 * 60000;
    else if (reminderOffset === 'custom' && reminderCustomTime) {
      const targetTime = new Date(reminderCustomTime).getTime();
      const difference = targetTime - Date.now();
      delayMs = difference > 0 ? difference : 10000;
    }

    const triggerAt = Date.now() + delayMs;
    const newReminder: LeadReminder = {
      id: `REM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      leadId: reminderTargetLeadId,
      customerName: leadObj.customerName,
      triggerAt,
      notes: reminderNotes.trim() || `Follow up on travel inquiries for ${leadObj.destinations}`,
      triggered: false
    };

    setReminders(prev => [newReminder, ...prev]);

    // Prompt browser permission if default
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const formattedTime = new Date(triggerAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const successToast: ToastMessage = {
      id: `toast-conf-${Math.random()}`,
      title: '✅ Reminder Programmed',
      message: `Follow-up chime scheduled at ${formattedTime}.`,
      type: 'success'
    };
    setToasts(prev => [successToast, ...prev]);

    // Reset fields
    setReminderTargetLeadId(null);
    setReminderOffset('10s');
    setReminderCustomTime('');
    setReminderNotes('');
  };

  const handleCancelReminder = (reminderId: string) => {
    setReminders(prev => prev.filter(r => r.id !== reminderId));
  };

  const handleClearTriggeredReminders = () => {
    setReminders(prev => prev.filter(r => !r.triggered));
  };

  const handleRemoveToast = (toastId: string) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  };

  // Simulated email dispatch animation state
  const [emailDispatching, setEmailDispatching] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<'idle' | 'sending' | 'completed'>('idle');

  // Interactive Lead Map hover state
  const [hoveredLeadId, setHoveredLeadId] = useState<string | null>(null);

  // Destination Coordinate Lookup Mapper for Interactive lead Map
  const getDestinationCoords = (dest: string): { x: number; y: number; region: string } => {
    const normalized = dest.toLowerCase();
    if (normalized.includes('mallorca') || normalized.includes('spain') || normalized.includes('ibiza')) {
      return { x: 450, y: 135, region: 'Mallorca (Western Europe)' };
    }
    if (normalized.includes('rome') || normalized.includes('paris') || normalized.includes('france') || normalized.includes('italy') || normalized.includes('mediterranean') || normalized.includes('europe')) {
      return { x: 470, y: 125, region: 'Mediterranean Core' };
    }
    if (normalized.includes('tokyo') || normalized.includes('japan') || normalized.includes('kyoto')) {
      return { x: 740, y: 135, region: 'Tokyo (East Asia)' };
    }
    if (normalized.includes('alpine') || normalized.includes('swiss') || normalized.includes('switzerland') || normalized.includes('alps')) {
      return { x: 462, y: 120, region: 'Swiss Alps (Central Europe)' };
    }
    if (normalized.includes('maui') || normalized.includes('hawaii') || normalized.includes('honolulu') || normalized.includes('tropical')) {
      return { x: 120, y: 150, region: 'Maui (Pacific Polynesia)' };
    }
    if (normalized.includes('london') || normalized.includes('uk') || normalized.includes('england') || normalized.includes('britain')) {
      return { x: 442, y: 110, region: 'London (United Kingdom)' };
    }
    if (normalized.includes('york') || normalized.includes('usa') || normalized.includes('ny') || normalized.includes('america')) {
      return { x: 280, y: 130, region: 'New York (North America)' };
    }
    if (normalized.includes('california') || normalized.includes('sf') || normalized.includes('angeles') || normalized.includes('west coast')) {
      return { x: 210, y: 135, region: 'California (US West Coast)' };
    }
    if (normalized.includes('sydney') || normalized.includes('australia') || normalized.includes('melbourne')) {
      return { x: 780, y: 250, region: 'Sydney (Australia)' };
    }
    if (normalized.includes('brazil') || normalized.includes('rio') || normalized.includes('amazon')) {
      return { x: 350, y: 220, region: 'Rio de Janeiro (South America)' };
    }
    if (normalized.includes('south africa') || normalized.includes('cape town')) {
      return { x: 495, y: 240, region: 'Cape Town (Southern Africa)' };
    }
    if (normalized.includes('bali') || normalized.includes('indonesia') || normalized.includes('thailand') || normalized.includes('phuket') || normalized.includes('asia')) {
      return { x: 690, y: 185, region: 'Bali (Southeast Asia)' };
    }

    // Dynamic deterministic coordinate calculation using string hashing
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
    }
    const x = 160 + (Math.abs(hash) % 550);
    const y = 100 + (Math.abs(hash * 3) % 130);
    return { x, y, region: 'Custom Horizon' };
  };

  // CSV Lead Exporter
  const handleExportCSV = () => {
    if (leads.length === 0) {
      alert("No leads available to export!");
      return;
    }
    const headers = ["Lead ID", "Customer Name", "Email", "Phone", "Budget (USD)", "Destinations", "Assigned Agent", "Pipeline Status", "Created Date", "Special Notes"];
    const csvRows = [headers.join(",")];
    
    leads.forEach(l => {
      const row = [
        l.id,
        l.customerName,
        l.email || '',
        l.phone || '',
        l.budget,
        l.destinations,
        l.assignedAgent || '',
        l.status,
        l.createdAt,
        (l.notes || '').replace(/\r?\n|\r/g, ' ').replace(/"/g, '""')
      ];
      csvRows.push(row.map(val => `"${val}"`).join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `travelgpt_leads_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create new customer lead
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newEmail.trim()) {
      alert("Name and email are mandatory parameters");
      return;
    }

    const createdLead: Lead = {
      id: `LD-${Math.floor(2000 + Math.random() * 8000)}`,
      customerName: newCustomerName,
      email: newEmail,
      phone: newPhone,
      budget: Number(newBudget),
      destinations: newDestinations,
      notes: newNotes,
      status: 'New',
      assignedAgent: "AI Copilot & You",
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddLead(createdLead);
    setSelectedLeadId(createdLead.id);
    setShowAddLead(false);
    
    // Reset fields
    setNewCustomerName('');
    setNewEmail('');
    setNewPhone('');
    setNewBudget('6000');
    setNewDestinations('Italy & France');
    setNewNotes('');
  };

  // Adjust current itinerary pricing based on markup selection
  const handleApplyMarkup = () => {
    if (!activeItinerary) return;
    const factor = 1 + (markupPercent / 100);
    const updatedItinerary: Itinerary = {
      ...activeItinerary,
      totalCostEstimate: Math.round(activeItinerary.totalCostEstimate * factor),
      days: activeItinerary.days.map(dayItem => ({
        ...dayItem,
        activities: dayItem.activities.map(act => ({
          ...act,
          // distibute cost multiplier appropriately
          cost: act.cost ? Math.round(act.cost * factor) : undefined
        }))
      }))
    };
    onUpdateItinerary(updatedItinerary);
    alert(`Markup of ${markupPercent}% applied successfully! Total price recalculated to $${updatedItinerary.totalCostEstimate.toLocaleString()}`);
  };

  // Simulate dispatch campaign
  const handleDispatchProposal = () => {
    if (!activeLead) return;
    setDispatchStatus('sending');
    setEmailDispatching(true);

    setTimeout(() => {
      setDispatchStatus('completed');
      setEmailDispatching(false);
    }, 2200);
  };

  // Cols definitions for B2B pipeline Board
  const columns: { label: string; status: Lead['status']; color: string }[] = [
    { label: 'Unassigned / New', status: 'New', color: 'border-t-sky-500 bg-sky-50/20' },
    { label: 'Qualified Leads', status: 'Qualified', color: 'border-t-indigo-500 bg-indigo-50/20' },
    { label: 'Itinerary Prepared', status: 'In Progress', color: 'border-t-amber-500 bg-amber-50/20' },
    { label: 'Closed / Booked', status: 'Booked', color: 'border-t-emerald-500 bg-emerald-50/20 font-semibold' },
    { label: 'Lost Opportunity', status: 'Lost', color: 'border-t-rose-500 bg-rose-50/10' }
  ];

  return (
    <div className="space-y-6 pb-12" id="agent-portal-core">
      
      {/* CRM LEAD KANBAN BOARD */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Collaborative Leads Pipeline
              <span className="text-xs bg-indigo-100 text-indigo-800 py-0.5 px-2 rounded-full font-medium">CRM Matrix</span>
            </h2>
            <p className="text-xs text-slate-500">Track incoming digital travel inquiries, qualified opportunities, and booked packages</p>
          </div>
          <div className="flex items-center gap-2">
            {reminders.length > 0 && (
              <button
                onClick={() => setShowRemindersPanel(!showRemindersPanel)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border ${
                  showRemindersPanel
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
                title="View active follow-up reminders"
              >
                <Bell className={`w-3.5 h-3.5 ${reminders.some(r => !r.triggered) ? 'animate-bounce text-indigo-650' : ''}`} />
                <span>Follow-ups ({reminders.filter(r => !r.triggered).length})</span>
              </button>
            )}
            <button
              onClick={handleExportCSV}
              className="py-1.5 px-3 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-slate-800"
              title="Export leads to CSV"
            >
              <Download className="w-3.5 h-3.5" /> Export Leads (CSV)
            </button>
            <button
              onClick={() => setShowAddLead(!showAddLead)}
              className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Add Incoming Lead Inquiries
            </button>
          </div>
        </div>

        {/* Reminders Panel */}
        {showRemindersPanel && (
          <div className="bg-slate-50 border border-slate-150 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between border-b border-slate-250/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-650 animate-bounce" />
                <h3 className="text-sm font-bold text-slate-900">Follow-up Reminder Board</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleClearTriggeredReminders}
                  className="px-2.5 py-1 text-[10px] font-semibold text-slate-500 hover:text-red-600 bg-white hover:bg-slate-100 rounded border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear Triggered
                </button>
                <button
                  onClick={() => setShowRemindersPanel(false)}
                  className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 rounded border border-slate-200 transition-colors cursor-pointer"
                >
                  Close Panel
                </button>
              </div>
            </div>

            {reminders.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-4">
                No scheduled reminders. Click the 🔔 icon on any lead item to create one!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                {reminders.map((rem) => {
                  const isOverdue = Date.now() >= rem.triggerAt && !rem.triggered;
                  const timeStr = new Date(rem.triggerAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const dateStr = new Date(rem.triggerAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
                  return (
                    <div 
                      key={rem.id} 
                      className={`p-3 rounded-lg border text-xs flex flex-col justify-between transition-all ${
                        rem.triggered 
                          ? 'bg-slate-100/60 border-slate-200 text-slate-500' 
                          : isOverdue 
                            ? 'bg-red-50/40 border-red-200 text-red-900 animate-pulse' 
                            : 'bg-white border-slate-150 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold truncate text-slate-850">{rem.customerName}</span>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                            rem.triggered 
                              ? 'bg-slate-200 text-slate-600' 
                              : 'bg-indigo-50 text-indigo-700 animate-pulse'
                          }`}>
                            {rem.triggered ? 'Triggered' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-650 italic line-clamp-2 mt-1 mb-2">"{rem.notes}"</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-2 text-[10px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1 font-semibold">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {dateStr} at {timeStr}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          {!rem.triggered && (
                            <button
                              onClick={() => {
                                // Instantly trigger the reminder
                                triggerReminderNotification(rem);
                                setReminders(prev => prev.map(r => r.id === rem.id ? { ...r, triggered: true } : r));
                              }}
                              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100 py-0.5 px-1.5 rounded transition-colors cursor-pointer"
                              title="Trigger now for testing"
                            >
                              Test Trigger
                            </button>
                          )}
                          <button
                            onClick={() => handleCancelReminder(rem.id)}
                            className="text-slate-400 hover:text-red-600 p-0.5 rounded hover:bg-slate-150 transition-colors cursor-pointer"
                            title="Delete reminder"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Add Lead Form Expansion block */}
        {showAddLead && (
          <form onSubmit={handleCreateLead} className="bg-slate-50 border border-slate-150 rounded-xl p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Customer Name</label>
              <input 
                type="text" 
                required
                value={newCustomerName} 
                onChange={(e) => setNewCustomerName(e.target.value)} 
                placeholder="e.g. John Doe"
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email Coordinates</label>
              <input 
                type="email" 
                required
                value={newEmail} 
                onChange={(e) => setNewEmail(e.target.value)} 
                placeholder="e.g. john@travels.com"
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone Coordinate</label>
              <input 
                type="text" 
                value={newPhone} 
                onChange={(e) => setNewPhone(e.target.value)} 
                placeholder="e.g. +1 555-0199"
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Budget Threshold ($)</label>
              <input 
                type="number" 
                value={newBudget} 
                onChange={(e) => setNewBudget(e.target.value)} 
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-indigo-500 font-bold" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Destinations of Interest</label>
              <input 
                type="text" 
                value={newDestinations} 
                onChange={(e) => setNewDestinations(e.target.value)} 
                placeholder="e.g. Italy, Switzerland"
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Special Traveler Demands</label>
              <input 
                type="text" 
                value={newNotes} 
                onChange={(e) => setNewNotes(e.target.value)} 
                placeholder="e.g. Wheelchair access, vegetarian family dining"
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-indigo-500" 
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setShowAddLead(false)}
                className="py-1.5 px-3 bg-slate-200 text-slate-700 text-xs rounded-lg font-semibold hover:bg-slate-300"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="py-1.5 px-4 bg-indigo-600 text-white text-xs rounded-lg font-bold hover:bg-indigo-700 hover:shadow-xs"
              >
                Log New Lead Entry
              </button>
            </div>
          </form>
        )}

        {/* Board grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto">
          {columns.map((col) => {
            const colLeads = leads.filter((l) => l.status === col.status);
            return (
              <div key={col.status} className={`border-t-4 rounded-xl p-3 flex flex-col min-h-[240px] ${col.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{col.label}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded-full">{colLeads.length}</span>
                </div>

                <div className="space-y-2 flex-1">
                  {colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className={`group p-3 bg-white border rounded-xl hover:shadow-xs hover:border-slate-300 transition-all cursor-pointer relative ${
                        selectedLeadId === lead.id ? 'border-indigo-600 ring-2 ring-indigo-500/10' : 'border-slate-150'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate flex-1">{lead.customerName}</h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReminderTargetLeadId(lead.id);
                          }}
                          className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1 rounded-md transition-all shrink-0 cursor-pointer"
                          title="Remind me to follow up"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{lead.destinations}</p>
                      
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[10px]">
                        <span className="font-bold text-slate-700">${lead.budget.toLocaleString()}</span>
                        {reminders.some(r => r.leadId === lead.id && !r.triggered) ? (
                          <span className="flex items-center gap-1 text-[9px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full font-bold animate-pulse" title="Reminder set">
                            <Clock className="w-2.5 h-2.5" />
                            <span>Remind</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">{lead.createdAt}</span>
                        )}
                      </div>
                    </div>
                  ))}

                  {colLeads.length === 0 && (
                    <div className="h-full border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center p-4">
                      <span className="text-[10px] text-slate-400 text-center uppercase tracking-wider font-semibold">Drop Area</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* INTERACTIVE GLOBAL LEAD MAP */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs" id="interactive-lead-map">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600 animate-spin-slow" />
              <span>Interactive Global Lead Network</span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 py-0.5 px-2 rounded-full font-bold">
                {leads.length} Active Targets
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Interactive geographical routing tracking. Hover pins for detailed lead metrics or click pins to load their itinerary workspace.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-1.5 font-semibold text-slate-650">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
              <strong className="text-slate-900 font-bold">Paris HQ</strong> Operational Hub
            </span>
          </div>
        </div>

        {/* SVG Map Canvas */}
        <div className="relative bg-slate-950 rounded-xl border border-slate-800 p-1 overflow-hidden select-none">
          {/* Legend Overlay top left */}
          <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-[10px] space-y-1.5 z-10 text-slate-400 font-mono shadow-md backdrop-blur-xs">
            <span className="block text-slate-300 font-bold uppercase text-[9px] tracking-wider mb-1">Pipeline Density</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <span>New Inquiries</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span>Qualified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Closed / Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Lost Opportunity</span>
            </div>
          </div>

          <svg 
            viewBox="0 0 900 320" 
            className="w-full h-auto text-slate-700 transition-all duration-300"
          >
            {/* Grid Coordinates Background */}
            <g opacity="0.15">
              {/* Latitude Lines */}
              <line x1="0" y1="80" x2="900" y2="80" stroke="#475569" strokeDasharray="4,4" strokeWidth="1" />
              <line x1="0" y1="160" x2="900" y2="160" stroke="#475569" strokeDasharray="4,4" strokeWidth="1" />
              <line x1="0" y1="240" x2="900" y2="240" stroke="#475569" strokeDasharray="4,4" strokeWidth="1" />
              
              {/* Longitude Lines */}
              <line x1="150" y1="0" x2="150" y2="320" stroke="#475569" strokeDasharray="4,4" strokeWidth="1" />
              <line x1="300" y1="0" x2="300" y2="320" stroke="#475569" strokeDasharray="4,4" strokeWidth="1" />
              <line x1="450" y1="0" x2="450" y2="320" stroke="#475569" strokeDasharray="4,4" strokeWidth="1" />
              <line x1="600" y1="0" x2="600" y2="320" stroke="#475569" strokeDasharray="4,4" strokeWidth="1" />
              <line x1="750" y1="0" x2="750" y2="320" stroke="#475569" strokeDasharray="4,4" strokeWidth="1" />

              {/* Labels */}
              <text x="10" y="74" fill="#94a3b8" fontSize="8" fontFamily="monospace">30° N</text>
              <text x="10" y="154" fill="#94a3b8" fontSize="8" fontFamily="monospace">0° Equator</text>
              <text x="10" y="234" fill="#94a3b8" fontSize="8" fontFamily="monospace">30° S</text>
              <text x="142" y="312" fill="#94a3b8" fontSize="8" fontFamily="monospace">120° W</text>
              <text x="292" y="312" fill="#94a3b8" fontSize="8" fontFamily="monospace">60° W</text>
              <text x="444" y="312" fill="#94a3b8" fontSize="8" fontFamily="monospace">0° Mer</text>
              <text x="592" y="312" fill="#94a3b8" fontSize="8" fontFamily="monospace">60° E</text>
              <text x="742" y="312" fill="#94a3b8" fontSize="8" fontFamily="monospace">120° E</text>
            </g>

            {/* Stylized Minimalist Continents Polygons */}
            <g fill="#1e293b" stroke="#334155" strokeWidth="1" opacity="0.6">
              {/* North America */}
              <polygon points="120,50 160,40 210,55 240,50 280,65 300,85 240,150 200,150 180,130 140,100" />
              {/* South America */}
              <polygon points="260,170 300,185 330,195 360,200 390,230 350,290 320,310 300,280 270,220" />
              {/* Eurasia / Central Europe & Asia */}
              <polygon points="400,60 430,70 500,65 600,60 720,50 820,65 850,90 840,140 760,190 690,190 640,195 540,195 480,155 420,125" />
              {/* Africa */}
              <polygon points="430,165 480,165 520,185 540,225 510,285 490,295 460,240 420,200" />
              {/* Australia */}
              <polygon points="740,240 780,230 810,250 790,285 750,280" />
              {/* Greenland */}
              <polygon points="320,20 370,15 390,30 350,45" />
            </g>

            {/* TravelGPT Operational HQ Node Marker */}
            <g transform="translate(450, 115)">
              <circle r="14" fill="#6366f1" opacity="0.15" className="animate-pulse" />
              <circle r="7" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
              <circle r="2" fill="#ffffff" />
            </g>
            <text x="450" y="100" fill="#a5b4fc" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">HQ: PARIS</text>

            {/* Draw network lines and markers dynamically for each Lead */}
            {leads.map((lead) => {
              const coords = getDestinationCoords(lead.destinations);
              const isSelected = selectedLeadId === lead.id;
              const isHovered = hoveredLeadId === lead.id;
              
              // Status coloring matches Kanban config
              let statusColor = "#38bdf8"; // sky-400 (New)
              if (lead.status === 'Qualified') statusColor = "#6366f1"; // indigo-500
              if (lead.status === 'In Progress') statusColor = "#f59e0b"; // amber-500
              if (lead.status === 'Booked') statusColor = "#10b981"; // emerald-500
              if (lead.status === 'Lost') statusColor = "#f43f5e"; // rose-500

              // Create curve bezier flight paths from HQ to target destinations
              const hqX = 450;
              const hqY = 115;
              const midX = (hqX + coords.x) / 2;
              const midY = ((hqY + coords.y) / 2) - 40; // Offset up for arched route feel
              
              return (
                <g key={`network-${lead.id}`}>
                  {/* Dynamic Flightpath Curve Line */}
                  <path
                    d={`M ${hqX} ${hqY} Q ${midX} ${midY} ${coords.x} ${coords.y}`}
                    fill="none"
                    stroke={isSelected ? '#6366f1' : '#475569'}
                    strokeWidth={isSelected ? 2 : 1.2}
                    strokeDasharray={isSelected ? "5,3" : "4,6"}
                    opacity={isSelected ? 1.0 : isHovered ? 0.8 : 0.35}
                    className="transition-all duration-300"
                    style={{
                      strokeDashoffset: isSelected ? 'inherit' : 0,
                      animation: isSelected ? 'dash 20s linear infinite' : 'none'
                    }}
                  />

                  {/* Pulsing radar target boundary indicator */}
                  <circle 
                    cx={coords.x} 
                    cy={coords.y} 
                    r={isHovered || isSelected ? 16 : 8} 
                    fill="none" 
                    stroke={statusColor} 
                    strokeWidth="1.5"
                    opacity={isHovered || isSelected ? 0.7 : 0.25}
                    className="animate-ping"
                    style={{ animationDuration: '3s' }}
                  />

                  {/* Intersect node point */}
                  <circle 
                    cx={coords.x} 
                    cy={coords.y} 
                    r={isSelected ? 7 : isHovered ? 6 : 4.5} 
                    fill={statusColor} 
                    stroke="#0f172a" 
                    strokeWidth={2}
                    className="cursor-pointer transition-all duration-200 hover:scale-150"
                    onClick={() => {
                      setSelectedLeadId(lead.id);
                      // Smooth scroll down to workspace
                      const workspaceElem = document.getElementById('lead-workspace-segment');
                      if (workspaceElem) {
                        workspaceElem.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    onMouseEnter={() => setHoveredLeadId(lead.id)}
                    onMouseLeave={() => setHoveredLeadId(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Floated interactive Tooltip Panel on Active Hover */}
          {leads.map((lead) => {
            if (hoveredLeadId !== lead.id && selectedLeadId !== lead.id) return null;
            const coords = getDestinationCoords(lead.destinations);
            const isHovered = hoveredLeadId === lead.id;
            const isSelected = selectedLeadId === lead.id;

            return (
              <div 
                key={`tooltip-${lead.id}`}
                className={`absolute bg-slate-900/95 border border-slate-800 rounded-lg p-3 text-white max-w-[210px] shadow-lg pointer-events-none transition-all duration-200 backdrop-blur-md ${
                  isHovered ? 'opacity-100 scale-100' : 'opacity-80 scale-95'
                }`}
                style={{
                  left: `${Math.min(85, Math.max(10, (coords.x / 900) * 100))}%`,
                  top: `${Math.min(75, Math.max(12, (coords.y / 320) * 100 + 6))}%`,
                  transform: 'translate(-50%, -105%)',
                }}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1">
                    <span className="text-[10px] font-mono text-slate-400">{lead.id}</span>
                    <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-black font-mono ${
                      lead.status === 'Booked' ? 'bg-emerald-500/20 text-emerald-400' :
                      lead.status === 'Lost' ? 'bg-rose-500/20 text-rose-400' :
                      lead.status === 'In Progress' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-sky-500/20 text-sky-400'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                  <h4 className="text-[11px] font-black tracking-tight text-white truncate">{lead.customerName}</h4>
                  <p className="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
                    <Compass className="w-3 h-3 text-indigo-400" />
                    <span className="truncate">{lead.destinations}</span>
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-bold pt-1.5 text-indigo-300">
                    <span>Budget Target:</span>
                    <span>${lead.budget.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Map Actions / Footer Stats */}
        <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-slate-500 flex-wrap gap-2 pt-2">
          <span className="flex items-center gap-1 text-slate-400 italic">
            * Coordinates map deterministic regions. Drag pins or click pipeline records to filter details.
          </span>
          <div className="flex gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Active Flight routes: <strong>{leads.length} modelled</strong>
            </span>
          </div>
        </div>
      </div>

      {/* DETAILED LEAD ASSIGNMENT & WORKSPACE PANEL */}
      {activeLead && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="lead-workspace-segment">
          
          {/* Traveler parameters */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Active Workspace Target</span>
                <h3 className="text-lg font-bold text-slate-950 mt-0.5">{activeLead.customerName}</h3>
              </div>
              <span className="text-xs font-bold font-mono text-slate-400">{activeLead.id}</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <p className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" /> {activeLead.email}
              </p>
              {activeLead.phone && (
                <p className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" /> {activeLead.phone}
                </p>
              )}
              <p className="flex items-center gap-2 text-slate-650">
                <DollarSign className="w-4 h-4 text-slate-400" /> Budget Limit: <strong className="text-slate-900">${activeLead.budget.toLocaleString()}</strong>
              </p>
              <p className="flex items-center gap-2 text-slate-650">
                <MapPin className="w-4 h-4 text-slate-400" /> Destinations: <strong className="text-slate-900">{activeLead.destinations}</strong>
              </p>
              {activeLead.notes && (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notes / Disclosed Demands</p>
                  <p className="text-[11px] text-slate-600 italic">"{activeLead.notes}"</p>
                </div>
              )}
            </div>

            {/* Change Pipeline status manually */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Advance pipeline status</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(['New', 'Qualified', 'In Progress', 'Booked', 'Lost'] as Lead['status'][]).map((statusValue) => (
                  <button
                    key={statusValue}
                    onClick={() => onUpdateLeadStatus(activeLead.id, statusValue)}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold text-center transition-all cursor-pointer ${
                      activeLead.status === statusValue 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {statusValue}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Agent Reassignment Section */}
            <div className="border-t border-slate-100 pt-4 mt-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Lead Assignment Manager</p>
              
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-semibold">Current Assignee:</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50/75 py-0.5 px-2 rounded-md">
                    {activeLead.assignedAgent?.includes('AI') || activeLead.assignedAgent?.includes('Copilot') || activeLead.assignedAgent?.includes('Coordinator') || activeLead.assignedAgent?.includes('Planner') ? (
                      <Bot className="w-3.5 h-3.5 text-indigo-650" />
                    ) : (
                      <Users className="w-3.5 h-3.5 text-indigo-650" />
                    )}
                    <span>{activeLead.assignedAgent || 'Unassigned'}</span>
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reassign to different agent</label>
                <select
                  value={activeLead.assignedAgent || ''}
                  onChange={(e) => {
                    const selectedAgent = e.target.value;
                    if (onUpdateLeadAgent) {
                      onUpdateLeadAgent(activeLead.id, selectedAgent);
                    }
                    
                    // Show a nice confirmation toast
                    const toastId = `toast-reassign-${Math.random()}`;
                    const reassignToast: ToastMessage = {
                      id: toastId,
                      title: '👤 Lead Reassigned',
                      message: `Successfully transferred ${activeLead.customerName} to ${selectedAgent}.`,
                      type: 'info'
                    };
                    setToasts(prev => [reassignToast, ...prev]);
                  }}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-250 rounded-lg outline-indigo-500 font-bold text-slate-750 cursor-pointer hover:border-slate-350 transition-colors"
                >
                  <option value="" disabled>-- Select Agent / Copilot --</option>
                  <optgroup label="Hybrid Workflows">
                    <option value="AI Copilot & You">🤖 AI Copilot & You (Hybrid)</option>
                  </optgroup>
                  <optgroup label="Human Experts">
                    <option value="You">👤 You (Lead Travel Agent)</option>
                    <option value="Sarah Jenkins">👤 Sarah Jenkins (Senior Cruise Specialist)</option>
                    <option value="Amir Patel">👤 Amir Patel (European Coordinator)</option>
                    <option value="Chen Wei">👤 Chen Wei (Asia-Pacific Planner)</option>
                  </optgroup>
                  <optgroup label="Autonomous AI Agents">
                    <option value="AI Copilot">🤖 AI Copilot (Core Automation)</option>
                    <option value="Client Support Coordinator">🤖 Client Support Coordinator (AI)</option>
                    <option value="Senior Itinerary Planner">🤖 Senior Itinerary Planner (AI)</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </div>

          {/* Dynamic AI Customizer block */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Itinerary Optimization Suite
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-100 py-0.5 px-2 rounded-full font-medium">B2B Agent Console</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Customize daily schedules and inject target markups before finalizing campaign proposals</p>
            </div>

            {activeItinerary ? (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Original Package Estimate</span>
                    <p className="text-sm font-bold text-slate-700">${activeItinerary.totalCostEstimate.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Target B2B Agent Markup (%)</label>
                    <input 
                      type="number" 
                      value={markupPercent} 
                      onChange={(e) => setMarkupPercent(Number(e.target.value))} 
                      className="w-20 px-2 py-0.5 text-xs bg-white border border-slate-200 rounded-md font-semibold focus:outline-none" 
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={handleApplyMarkup} 
                      className="w-full py-1.5 px-3 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Apply Markup Multiplier
                    </button>
                  </div>
                </div>

                {/* Add Custom Manual Remarks */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Custom Agent Slogan/Notes on Itinerary</label>
                  <textarea
                    rows={2}
                    value={agentManualNote}
                    onChange={(e) => setAgentManualNote(e.target.value)}
                    placeholder="Provide bespoke customized elements (e.g. airport pickups, luggage clearance details)..."
                    className="w-full text-xs p-3 bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-700 border border-slate-200 rounded-lg outline-indigo-500"
                  />
                </div>

                {/* Dispatch control */}
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <Bot className="w-6 h-6 text-indigo-600 animate-pulse" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Personalized Digital Campaign Pitch</p>
                      <p className="text-[11px] text-slate-500">Dispatch this itinerary to {activeLead.customerName} via email, SMS, and TravelGPT dynamic companion link</p>
                    </div>
                  </div>

                  {dispatchStatus === 'idle' ? (
                    <button
                      onClick={handleDispatchProposal}
                      className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Dispatch Proposal Now
                    </button>
                  ) : dispatchStatus === 'sending' ? (
                    <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5 bg-indigo-100 py-1.5 px-3 rounded-lg border border-indigo-200">
                      <Send className="w-3.5 h-3.5 animate-spin" /> Distributing digital feeds...
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-100">
                      <Check className="w-3.5 h-3.5" /> Client Proposal Dispatched!
                    </span>
                  )}
                </div>

                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/40">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Package Contents Preview</p>
                  <p className="text-xs text-slate-600">Location: <strong className="text-slate-950">{activeItinerary.destination}</strong> / Expected Climate: <strong className="text-slate-800">{activeItinerary.weatherEstimate}</strong></p>
                  
                  <div className="mt-3 space-y-2">
                    {activeItinerary.days.map(dItem => (
                      <div key={dItem.day} className="text-[11px] flex items-start gap-2 bg-white p-2 rounded border border-slate-150">
                        <span className="font-bold text-indigo-600">Day {dItem.day}</span>
                        <div>
                          <p className="font-semibold text-slate-900">{dItem.title}</p>
                          <p className="text-slate-500 text-[10px] truncate max-w-md">{dItem.activities.map(a=>a.title).join(" → ")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50 text-center space-y-2.5">
                <AlertCircle className="w-8 h-8 text-indigo-400 mx-auto animate-bounce" />
                <h4 className="text-sm font-semibold text-slate-900">No active itinerary in current draft workspace</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">Click on the "Customer Portal" tab, configure requirements, and tap "Build AI Optimized Itinerary". The agent terminal will automatically synchronize your planning results.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Dynamic Toast Notifications container overlay */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl border shadow-xl flex gap-3 pointer-events-auto transition-all duration-300 transform translate-y-0 ${
              toast.type === 'reminder'
                ? 'bg-slate-900 border-indigo-500 text-white animate-bounce'
                : toast.type === 'success'
                  ? 'bg-white border-emerald-200 text-slate-800'
                  : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex-1">
              <p className="text-xs font-bold flex items-center gap-1.5">
                {toast.title}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">{toast.message}</p>
              
              {toast.leadId && (
                <button
                  onClick={() => {
                    setSelectedLeadId(toast.leadId!);
                    // Scroll to workspace segment
                    const workspaceElem = document.getElementById('lead-workspace-segment');
                    if (workspaceElem) {
                      workspaceElem.scrollIntoView({ behavior: 'smooth' });
                    }
                    // Dismiss toast
                    handleRemoveToast(toast.id);
                  }}
                  className="mt-2.5 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-[10px] text-white font-bold rounded transition-colors cursor-pointer pointer-events-auto"
                >
                  View Lead Workspace
                </button>
              )}
            </div>
            <button
              onClick={() => handleRemoveToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 self-start p-0.5 rounded cursor-pointer pointer-events-auto"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Set Reminder Modal Dialog Overlay */}
      {reminderTargetLeadId && (() => {
        const leadObj = leads.find(l => l.id === reminderTargetLeadId);
        if (!leadObj) return null;
        return (
          <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full p-6 shadow-2xl relative space-y-4">
              <button
                onClick={() => setReminderTargetLeadId(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <Bell className="w-5 h-5 text-indigo-600 animate-pulse" />
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">Schedule Follow-up</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Configure automatic system reminder for <strong className="text-slate-700">{leadObj.customerName}</strong></p>
                </div>
              </div>

              <form onSubmit={handleSetReminder} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reminder Offset</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: '10s', label: '10 Secs (Test)' },
                      { value: '1m', label: '1 Min' },
                      { value: '5m', label: '5 Mins' },
                      { value: '15m', label: '15 Mins' },
                      { value: '1h', label: '1 Hour' },
                      { value: 'custom', label: 'Custom Date' }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setReminderOffset(opt.value as any)}
                        className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          reminderOffset === opt.value
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {reminderOffset === 'custom' && (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select custom date & time</label>
                    <input
                      type="datetime-local"
                      required
                      value={reminderCustomTime}
                      onChange={(e) => setReminderCustomTime(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg outline-indigo-500 font-bold"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bespoke Follow-up Notes</label>
                  <textarea
                    rows={3}
                    value={reminderNotes}
                    onChange={(e) => setReminderNotes(e.target.value)}
                    placeholder="e.g. Call client back to discuss business class hotel adjustments and cruise extensions..."
                    className="w-full text-xs p-3 bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-700 border border-slate-200 rounded-lg outline-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setReminderTargetLeadId(null)}
                    className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" /> Start Follow-up Timer
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
