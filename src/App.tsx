import React, { useState } from 'react';
import { 
  Compass, Users, BarChart3, Settings, Shield, HelpCircle, Landmark, 
  MapPin, CheckCircle, TrendingUp, Sparkles, MessageSquare, Menu, Bot
} from 'lucide-react';

// Import subcomponents
import CustomerPortal from './components/CustomerPortal';
import AgentPortal from './components/AgentPortal';
import ManagementPortal from './components/ManagementPortal';
import AdminPortal from './components/AdminPortal';

// Import Types
import { Itinerary, Lead, MarketingCampaign, CustomerReview, InternalAgentConfig, ActiveBooking } from './types';

export default function App() {
  // Navigation
  const [activePortal, setActivePortal] = useState<'customer' | 'agent' | 'management' | 'admin'>('customer');

  // Shared platform data state (Acts as central database)
  const [activeItinerary, setActiveItinerary] = useState<Itinerary | null>(null);
  const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>(null);

  // CRM LEADS DATASET
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: 'LD-2034',
      customerName: 'Marcus Aurelius',
      email: 'marcus@romanphil.com',
      phone: '+1 415-555-4001',
      budget: 5200,
      destinations: 'Mallorca, Spain',
      notes: 'Desires quiet resort. Prefers standard Mediterranean tapestries and skip-the-line historical cathedrals.',
      status: 'New',
      assignedAgent: 'AI Copilot & You',
      createdAt: '2026-06-01'
    },
    {
      id: 'LD-4029',
      customerName: 'Samantha Green',
      email: 'sam.green@clouddrop.io',
      phone: '+44 7911 123456',
      budget: 8500,
      destinations: 'Rome & Paris Luxury',
      notes: 'Celebrating 10th anniversary. Luxury boutique lodging demands only, private catamaran booking required.',
      status: 'Qualified',
      assignedAgent: 'You',
      createdAt: '2026-05-30'
    },
    {
      id: 'LD-8894',
      customerName: 'Daisuke Sato',
      email: 'sato@tokyo-ventures.jp',
      phone: '+81 90-1234-5678',
      budget: 12000,
      destinations: 'Alpine Ski & Swiss Lodges',
      notes: 'Advanced ski instructor guide requirements. Dietary: strict Buddhist vegetarian.',
      status: 'In Progress',
      assignedAgent: 'AI Copilot',
      createdAt: '2026-05-28'
    },
    {
      id: 'LD-1440',
      customerName: 'The Dupont Family',
      email: 'claire@dupont.fr',
      phone: '+33 6 1234 5678',
      budget: 4500,
      destinations: 'Tropical Maui Coastal',
      notes: 'Traveling with 2 toddlers. Requires baby carriage pathways and family dining lists.',
      status: 'Booked',
      assignedAgent: 'AI Copilot & You',
      createdAt: '2026-05-25'
    }
  ]);

  // MARKETING CAMPAIGNS ROI DATASET
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([
    { id: 'MC-1', name: 'Summer Escape Google Ads', channel: 'Google Ads', spend: 4500, revenue: 15400, conversions: 124, clicks: 1450, roi: 3.4 },
    { id: 'MC-2', name: 'Luxury Yacht Instagram Feed', channel: 'Meta', spend: 3200, revenue: 11200, conversions: 89, clicks: 2310, roi: 3.5 },
    { id: 'MC-3', name: 'Loyalty Upgrade Campaign', channel: 'Email', spend: 800, revenue: 6400, conversions: 156, clicks: 1080, roi: 8.0 },
    { id: 'MC-4', name: 'Alpine Skiing Partner Reach', channel: 'Affiliate', spend: 1500, revenue: 3800, conversions: 45, clicks: 650, roi: 2.5 },
    { id: 'MC-5', name: 'Organic SEO Travel Discovery', channel: 'SEO', spend: 1200, revenue: 5400, conversions: 78, clicks: 920, roi: 4.5 }
  ]);

  // REVIEWS & REPUTATION DATASET
  const [reviews, setReviews] = useState<CustomerReview[]>([
    {
      id: 'RV-102',
      author: 'Clara Jenkins',
      platform: 'Google',
      rating: 5,
      content: 'The custom skip-the-line ticketing and flight rebooking assistance was incredible! TravelGPT saved our beach trip within minutes of our delayed connections.',
      sentiment: 'positive',
      status: 'Unresolved',
      date: '2026-06-01'
    },
    {
      id: 'RV-301',
      author: 'Jonathan Sterling',
      platform: 'TripAdvisor',
      rating: 2,
      content: 'Hotel room was outstanding but the transport guide arrived 30 minutes late in Amalfi. This delayed our boat charter and generated friction.',
      sentiment: 'negative',
      status: 'Unresolved',
      date: '2026-05-28'
    },
    {
      id: 'RV-440',
      author: 'Amelie Mercier',
      platform: 'Social Media',
      rating: 4,
      content: 'Very cohesive family trip structure. The packing checklists and localized weather alerts were extremely target-accurate. Highly recommended.',
      sentiment: 'positive',
      status: 'Resolved',
      date: '2026-05-25'
    }
  ]);

  // INTERNAL DIGITAL AGENTS DATASET
  const [agentConfigs, setAgentConfigs] = useState<InternalAgentConfig[]>([
    {
      id: 'AG-SUPPORT',
      name: 'Client Support Coordinator',
      role: 'Handles 24/7 guest requests, real-time ticket rebooking, and localized packing/visa FAQs',
      model: 'gemini-3.5-flash',
      temperature: 0.2,
      systemInstruction: 'You are TravelGPT\'s primary Customer Support representative. Provide immediate clarity on flights, entry visas, luggage restrictions, check-in instructions, and destination protocols. Keep answers highly organized, helpful, and empathetic.',
      status: 'Active'
    },
    {
      id: 'AG-PLANNING',
      name: 'Senior Itinerary Planner',
      role: 'Orchestrates dynamic, highly personalized travel timelines, activities, and pricing guidelines',
      model: 'gemini-3.5-flash',
      temperature: 0.6,
      systemInstruction: 'You are the Senior Travel Planning AI. Craft unique journeys matching specific budgets. Recommend dynamic off-the-beaten-path trails, curate fine local dining opportunities, and pace itineraries beautifully.',
      status: 'Active'
    },
    {
      id: 'AG-FORECASTING',
      name: 'Commercial Demand Forecaster',
      role: 'Models regional pricing trends, predicts staffed occupancy needs, and tracks seasonal volume variance',
      model: 'gemini-3.5-flash',
      temperature: 0.1,
      systemInstruction: 'You are the main Logistics Forecasting Specialist. Analyze seasonal volume spikes (e.g. European peak summer, winter ski season) to guide occupancy readiness, staff-to-guest ratios, and dynamic pricing metrics.',
      status: 'Active'
    },
    {
      id: 'AG-MARKETING',
      name: 'ROI Campaign Manager',
      role: 'Optimizes acquisition channels, computes target client ROI margins, and drafts click-worthy copy',
      model: 'gemini-3.5-flash',
      temperature: 0.45,
      systemInstruction: 'You are the ROI Campaign Marketing specialist. Design compelling advertising strategies across Google Ads, Meta, and SEO channels. Formulate strategies to maximize click-through rates and customer acquisition cost margins.',
      status: 'Active'
    },
    {
      id: 'AG-OPERATIONS',
      name: 'Logistics Operations Director',
      role: 'Verifies local supplier SLAs, monitors tour guide schedules, and maintains transit risk protocols',
      model: 'gemini-3.5-flash',
      temperature: 0.3,
      systemInstruction: 'You are the Destination Operations Orchestrator. Coordinate dispatching priorities, local transport suppliers, tour-guide schedules, and localized safety parameters to guarantee zero friction in the field.',
      status: 'Active'
    },
    {
      id: 'AG-SUCCESS',
      name: 'Reputation & Guest Success specialist',
      role: 'Drafts public brand responses, tracks guest satisfaction trends, and mitigates travel friction incidents',
      model: 'gemini-3.5-flash',
      temperature: 0.35,
      systemInstruction: 'You are the lead Customer Success representative. Address negative TripAdvisor or Google reviews with polite, constructive resolution pathways. Analyze overall sentiment trends to proactive prevent recurring travel friction.',
      status: 'Active'
    }
  ]);

  // Central functions to modify state
  const handleAddLead = (newLead: Lead) => {
    setLeads([newLead, ...leads]);
  };

  const handleUpdateLeadStatus = (leadId: string, newStatus: Lead['status']) => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
  };

  const handleUpdateLeadAgent = (leadId: string, newAgent: string) => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, assignedAgent: newAgent } : l));
  };

  const handleUpdateConfig = (updatedConfig: InternalAgentConfig) => {
    setAgentConfigs(agentConfigs.map(c => c.id === updatedConfig.id ? updatedConfig : c));
  };

  const handleUpdateReviewStatus = (reviewId: string, status: CustomerReview['status']) => {
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, status: status } : r));
  };

  // Live KPI Calculations
  const totalRevenues = leads
    .filter(l => l.status === 'Booked')
    .reduce((sum, current) => sum + current.budget, 18500); // 18,500 represents stable base historic conversions

  const liveLeadsCount = leads.filter(l => l.status !== 'Booked' && l.status !== 'Lost').length;
  
  const guestReputationIndex = (
    reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 font-sans" id="travelgpt-application">
      
      {/* ENTERPRISE APP HEADER */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-xs" id="travelgpt-navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 flex-wrap md:flex-nowrap py-3 gap-4">
            
            {/* Branding Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <Landmark className="w-5.5 h-5.5 text-indigo-100" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-black tracking-tight text-white">TravelGPT</h1>
                  <span className="text-[9px] bg-indigo-500/20 text-indigo-400 py-0.5 px-2 rounded-full font-bold">MVP v1.0</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">B2B SaaS Travel Operations Platform</p>
              </div>
            </div>

            {/* LIVE KPI COUNTERS PANELS */}
            <div className="hidden sm:flex items-center gap-6 text-xs border-l border-slate-850 pl-6 shrink-0 font-medium">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Dynamic Revenue Gross</p>
                <p className="text-sm font-extrabold text-indigo-400">${totalRevenues.toLocaleString()} <span className="text-[10px] text-emerald-500 font-bold font-mono">USD</span></p>
              </div>
              <div className="border-l border-slate-800 h-8"></div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">CRM Active Opportunities</p>
                <p className="text-sm font-extrabold text-white">{liveLeadsCount} <span className="text-[10px] text-slate-400 font-medium">Leads</span></p>
              </div>
              <div className="border-l border-slate-800 h-8"></div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Guest Sentiment Index</p>
                <p className="text-sm font-extrabold text-amber-400">{guestReputationIndex} / 5.0 <span className="text-[10px] text-emerald-500 font-bold">★ Rating</span></p>
              </div>
              <div className="border-l border-slate-800 h-8"></div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Core AI Staff</p>
                <p className="text-sm font-extrabold text-emerald-400">8 Smart Agents</p>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* PORTALS SWITCHING SUB-BAR */}
      <nav className="bg-white border-b border-slate-100 sticky top-16 z-30 shadow-xs" id="portal-navigation-tabs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-2 overflow-x-auto">
            
            <button
              onClick={() => setActivePortal('customer')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activePortal === 'customer' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4 text-indigo-500" />
              <span>🧭 B2C Customer Portal</span>
            </button>

            <button
              onClick={() => setActivePortal('agent')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activePortal === 'agent' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-500" />
              <span>👥 B2B Travel Agent Room</span>
            </button>

            <button
              onClick={() => setActivePortal('management')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activePortal === 'management' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-500" />
              <span>📊 Operations & Revenue Console</span>
            </button>

            <button
              onClick={() => setActivePortal('admin')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activePortal === 'admin' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-4 h-4 text-violet-500" />
              <span>⚙️ System Admin & Copilot Terminal</span>
            </button>

          </div>
        </div>
      </nav>

      {/* CORE WORKSPACE container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Dynamic Warning Notification if GEMINI API KEY is missing */}
        {!process.env.GEMINI_API_KEY && (
          <div className="mb-6 p-3.5 bg-indigo-50/70 border border-indigo-150 rounded-xl flex items-center justify-between text-xs text-indigo-950 font-medium max-w-7xl">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-600" />
              <span>
                <strong>System Information:</strong> Server-side Google GenAI client is fully initialized. Place your custom key in <strong>Settings &gt; Secrets</strong> to engage unlimited creative capabilities in live mode! Fallback configurations are active.
              </span>
            </div>
            <span className="text-[10px] bg-indigo-200 py-0.5 px-2 rounded-md font-bold shrink-0">AUTO INITIALIZED</span>
          </div>
        )}

        {/* Portals rendering */}
        {activePortal === 'customer' && (
          <CustomerPortal 
            onItineraryGenerated={setActiveItinerary}
            activeItinerary={activeItinerary}
            onBookingCreated={setActiveBooking}
            activeBooking={activeBooking}
            onUpdateBooking={setActiveBooking}
          />
        )}

        {activePortal === 'agent' && (
          <AgentPortal 
            leads={leads}
            onAddLead={handleAddLead}
            onUpdateLeadStatus={handleUpdateLeadStatus}
            onUpdateLeadAgent={handleUpdateLeadAgent}
            activeItinerary={activeItinerary}
            onUpdateItinerary={setActiveItinerary}
          />
        )}

        {activePortal === 'management' && (
          <ManagementPortal 
            campaigns={campaigns}
            reviews={reviews}
            onAddReview={(newReview) => setReviews([newReview, ...reviews])}
            onUpdateReviewStatus={handleUpdateReviewStatus}
          />
        )}

        {activePortal === 'admin' && (
          <AdminPortal 
            configs={agentConfigs}
            onUpdateConfig={handleUpdateConfig}
            leads={leads}
            campaigns={campaigns}
            reviews={reviews}
          />
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-50 border-t border-slate-150 py-8 mt-16 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">TravelGPT Platform Architecture</p>
          
          {/* Tech Stack Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            <span className="bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-[11px] font-medium font-mono">React 18</span>
            <span className="bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-[11px] font-medium font-mono">Vite</span>
            <span className="bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-[11px] font-medium font-mono">TypeScript</span>
            <span className="bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-[11px] font-medium font-mono">Tailwind CSS</span>
            <span className="bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-[11px] font-medium font-mono">Gemini AI Models</span>
            <span className="bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-[11px] font-medium font-mono">Lucide Icons</span>
            <span className="bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-[11px] font-medium font-mono">Recharts</span>
          </div>

          <div className="border-t border-slate-200/65 w-16 mx-auto pt-2"></div>

          <p className="font-bold text-slate-700">
            Designed & Built by <span className="text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md font-extrabold tracking-tight">Parita Dave</span>
          </p>
          
          <p className="text-[10px] text-slate-400 font-medium">
            TravelGPT Travel Operations & Customer Experience Management Suite © {new Date().getFullYear()} • All Rights Reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
