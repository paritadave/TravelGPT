import React, { useState } from 'react';
import { 
  Compass, Sparkles, MapPin, Calendar, Users, DollarSign, CloudSun, Briefcase, 
  ChevronRight, ChevronDown, CheckCircle, Smartphone, Printer, ShieldAlert, 
  Send, Bot, Plane, Hotel, Map, Palmtree, RefreshCw, AlertTriangle, ExternalLink
} from 'lucide-react';
import { Itinerary, ActiveBooking } from '../types';

interface CustomerPortalProps {
  onItineraryGenerated: (itinerary: Itinerary) => void;
  activeItinerary: Itinerary | null;
  onBookingCreated: (booking: ActiveBooking) => void;
  activeBooking: ActiveBooking | null;
  onUpdateBooking: (booking: ActiveBooking) => void;
}

export default function CustomerPortal({
  onItineraryGenerated,
  activeItinerary,
  onBookingCreated,
  activeBooking,
  onUpdateBooking
}: CustomerPortalProps) {
  // Discovery form state
  const [budget, setBudget] = useState('5000');
  const [dates, setDates] = useState('July 2026');
  const [familySize, setFamilySize] = useState('4');
  const [preferredWeather, setPreferredWeather] = useState('Sunny and warm');
  const [interests, setInterests] = useState<string[]>(['beaches', 'culture']);
  const [customInterests, setCustomInterests] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Active accordion day
  const [openDay, setOpenDay] = useState<number | null>(1);

  // Chatbot states
  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Hi! I am your TravelGPT Assistance Concierge. I can help search live flights status, give local food spots, custom packing suggestions, or detail emergency details.' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Simulated printing or exporting state
  const [showExportModal, setShowExportModal] = useState(false);
  const [savingPackage, setSavingPackage] = useState(false);

  // Form selections lists
  const availableInterests = ['beaches', 'culture', 'adventure', 'food & wine', 'history', 'family-friendly', 'nature', 'luxury'];

  const handleInterestToggle = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleAddCustomInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInterests.trim() && !interests.includes(customInterests.trim().toLowerCase())) {
      setInterests([...interests, customInterests.trim().toLowerCase()]);
      setCustomInterests('');
    }
  };

  // Run AI Trip Generator
  const handleGenerateItinerary = async () => {
    setLoading(true);
    setLoadingStep(0);
    
    // Simulate thinking phases for engagement
    const intervals = [
      "Analyzing geographical flight corridors and luxury lodging...",
      "Matching local dynamic schedules under budget...",
      "Assembling daily Michelin spots and hidden pathways...",
      "Generating high-resolution travel mapping data..."
    ];

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev < intervals.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 1800);

    try {
      const response = await fetch('/api/gemini/inspire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget: Number(budget),
          dates,
          familySize: Number(familySize),
          interests,
          preferredWeather,
          notes
        })
      });
      
      const data = await response.json();
      onItineraryGenerated(data);
      setOpenDay(1);
    } catch (err) {
      console.error(err);
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  // Convert current itinerary to Active Booking
  const handleBookPackage = () => {
    if (!activeItinerary) return;
    setSavingPackage(true);

    setTimeout(() => {
      const newBooking: ActiveBooking = {
        id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: "Current User",
        destination: activeItinerary.destination,
        startDate: dates,
        endDate: "4 days later",
        flightStatus: 'Ontime',
        flightDetails: "Flight IB-3240 (Airbus A350) - Departs 08:30 AM",
        hotelName: activeItinerary.days[0]?.activities.find(a => a.type === 'hotel')?.title || "Luxury Partner Resort",
        hotelStatus: 'Confirmed',
        alerts: [
          "Visa exempt status active for holiday duration.",
          "Pack SPF 50+ cosmetics & lightweight linen."
        ]
      };
      onBookingCreated(newBooking);
      setSavingPackage(false);
    }, 1500);
  };

  // Trigger simulated Flight Disruption (B2B Recovery Agent demo)
  const handleSimulateDisruption = () => {
    if (!activeBooking) return;
    
    const delayedBooking: ActiveBooking = {
      ...activeBooking,
      flightStatus: 'Cancelled',
      flightDetails: "Flight IB-3240 CANCELLED due to airspace restrictions",
      alerts: [
        "CRITICAL: Flight IB-3240 has been Cancelled by the airline.",
        "AI Recovery Agent is active: Re-routing options computed automatically."
      ],
      recoveryOptions: [
        "Rebook to Flight LH-1804 departing 2h 30m later (No additional fee)",
        "Premium hotel voucher + Direct departure tomorrow morning (+ $150 compensation)",
        "Request full instantaneous airline refund back to original credit card"
      ]
    };
    onUpdateBooking(delayedBooking);
  };

  const handleApplyRecovery = (option: string) => {
    if (!activeBooking) return;
    const resolvedBooking: ActiveBooking = {
      ...activeBooking,
      flightStatus: 'Ontime',
      flightDetails: `Rebooked successfully on LH-1804 (Confirmed via recovery)`,
      alerts: [
        "Disruption resolved successfully via AI Recovery Agent.",
        "Mobile boarding passes delivered instantly to your device."
      ],
      recoveryOptions: undefined
    };
    onUpdateBooking(resolvedBooking);
  };

  // Send message to live Gemini client on server
  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: chatMessages,
          context: activeItinerary ? {
            destination: activeItinerary.destination,
            budget: activeItinerary.budget,
            daysCount: activeItinerary.durationDays,
            weather: activeItinerary.weatherEstimate
          } : null
        })
      });
      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'assistant', text: data.text || "I apologize, I am temporarily unable to fetch standard responses." }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'assistant', text: "Server-side chat communication failed. Please verify your internet connection or console stack." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Dynamic values helper
  const getIcon = (type: string) => {
    switch(type) {
      case 'flight': return <Plane className="w-4 h-4 text-sky-500" />;
      case 'hotel': return <Hotel className="w-4 h-4 text-emerald-500" />;
      case 'attraction': return <Map className="w-4 h-4 text-violet-500" />;
      case 'restaurant': return <Palmtree className="w-4 h-4 text-amber-500" />;
      default: return <Compass className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12" id="customer-portal-main">
      {/* LEFT FORM BLOCK & RESULTS */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Destination Discovery Module */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs" id="trip-planner-config">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                AI Discovery & Dynamic Planner
                <span className="text-xs bg-indigo-100 text-indigo-800 py-0.5 px-2 rounded-full font-medium">B2C SaaS</span>
              </h2>
              <p className="text-xs text-slate-500">Provide luxury constraints and let Gemini structure an end-to-end trip</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-widest mb-1.5">Max Package Budget ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="number" 
                  value={budget} 
                  onChange={(e) => setBudget(e.target.value)} 
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-widest mb-1.5">Target Month/Dates</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={dates} 
                  onChange={(e) => setDates(e.target.value)} 
                  placeholder="e.g. July 2026" 
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-widest mb-1.5">Family size (travelers count)</label>
              <div className="relative">
                <Users className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="number" 
                  value={familySize} 
                  onChange={(e) => setFamilySize(e.target.value)} 
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-widest mb-1.5">Climate Preferred</label>
              <div className="relative">
                <CloudSun className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <select 
                  value={preferredWeather} 
                  onChange={(e) => setPreferredWeather(e.target.value)} 
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                >
                  <option value="Sunny and warm">Sunny and warm (Mediterranean)</option>
                  <option value="Alpine Cool & Fresh">Alpine Cool & Fresh (Mountainous)</option>
                  <option value="Tropical Humid Coastal">Tropical Humid Coastal (Islands)</option>
                  <option value="Crisp Autumn Vibe">Crisp Autumn Vibe (Urban Explorers)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-widest mb-1.5">Select Interests</label>
            <div className="flex flex-wrap gap-2">
              {availableInterests.map((interest) => (
                <button
                  key={interest}
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-3 py-1 text-xs rounded-full border transition-all ${
                    interests.includes(interest)
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Interest Input */}
          <form onSubmit={handleAddCustomInterest} className="mt-3 flex gap-2">
            <input 
              type="text" 
              value={customInterests} 
              onChange={(e) => setCustomInterests(e.target.value)} 
              placeholder="Add other custom interest..." 
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg max-w-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" 
            />
            <button type="submit" className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs rounded-lg font-medium">Add</button>
          </form>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-widest mb-1.5">Special demands / constraints</label>
            <input 
              type="text" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="e.g. Toddler with baby wagon, wheelchair accessibility, strict vegetarian dining" 
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
            />
          </div>

          <button
            onClick={handleGenerateItinerary}
            disabled={loading}
            className="w-full mt-6 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors text-white font-semibold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Designing Dream Route (Active GenAI on Server)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Build AI Optimized Itinerary</span>
              </>
            )}
          </button>

          {/* Live Progress feedback */}
          {loading && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
              <Bot className="w-6 h-6 text-indigo-500 animate-bounce" />
              <div className="flex-1">
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-1.5 transition-all duration-1000 ease-out" 
                    style={{ width: `${(loadingStep + 1) * 25}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1 font-medium italic">
                  {loadingStep === 0 && "Analyzing geographical flight corridors and luxury lodging..."}
                  {loadingStep === 1 && "Matching local dynamic schedules under budget..."}
                  {loadingStep === 2 && "Assembling daily Michelin spots and hidden pathways..."}
                  {loadingStep === 3 && "Generating high-resolution travel mapping data..."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Map/Itinerary Display Area */}
        {activeItinerary && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6" id="generated-package-view">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 py-1 px-2.5 rounded-md">Curated Recommendation</span>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                  {activeItinerary.destination}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <CloudSun className="w-3.5 h-3.5 text-amber-500" />
                  {activeItinerary.weatherEstimate}
                </p>
              </div>
              <div className="bg-slate-50 py-2.5 px-4 rounded-xl border border-slate-100 text-right">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Cost Estimate</p>
                <p className="text-xl font-black text-slate-900">${activeItinerary.totalCostEstimate.toLocaleString()}</p>
                <p className="text-[10px] text-emerald-600 font-medium">Within $${activeItinerary.budget} budget</p>
              </div>
            </div>

            {/* Print and Export Utilities */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowExportModal(true)} 
                className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print/Export Itinerary
              </button>
              <button 
                onClick={() => alert(`Simulated SMS board: Mobile boarding details linked to current session.`)} 
                className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" /> Send to Phone
              </button>
              
              {!activeBooking ? (
                <button 
                  onClick={handleBookPackage}
                  disabled={savingPackage}
                  className="ml-auto py-2 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {savingPackage ? "Locking Reservation..." : "Confirm & Instant-Book Package"}
                </button>
              ) : (
                <span className="ml-auto text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-100">
                  <CheckCircle className="w-4 h-4" /> Package Reserved Successfully
                </span>
              )}
            </div>

            {/* Interactive Day Breakdown Accordion */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Day-by-Day Experience</h4>
              
              {activeItinerary.days.map((dayItem) => (
                <div key={dayItem.day} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/40">
                  <button
                    onClick={() => setOpenDay(openDay === dayItem.day ? null : dayItem.day)}
                    className="w-full flex items-center justify-between p-4 bg-white text-left font-semibold text-slate-800 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center">
                        D{dayItem.day}
                      </span>
                      <div>
                        <span className="text-xs text-slate-400">Day {dayItem.day}</span>
                        <h5 className="text-sm font-bold text-slate-900">{dayItem.title}</h5>
                      </div>
                    </div>
                    {openDay === dayItem.day ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                  </button>

                  {openDay === dayItem.day && (
                    <div className="p-4 bg-white border-t border-slate-100/60 space-y-4">
                      {dayItem.activities.map((act, index) => (
                        <div key={index} className="flex gap-4 items-start relative pl-6 border-l-2 border-dashed border-slate-200 py-1">
                          <div className="absolute -left-3.5 top-1 p-1 bg-white border border-slate-200 rounded-full">
                            {getIcon(act.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 py-0.5 px-1.5 rounded-sm font-bold uppercase">{act.time}</span>
                              {act.cost ? (
                                <span className="text-xs font-bold text-slate-700">${act.cost}</span>
                              ) : (
                                <span className="text-[10px] text-emerald-600 bg-emerald-50 py-0.5 px-1.5 rounded-sm font-medium">Included</span>
                              )}
                            </div>
                            <h6 className="text-sm font-bold text-slate-900 mt-1">{act.title}</h6>
                            <p className="text-xs text-slate-500 mt-0.5">{act.description}</p>
                            {act.locationName && (
                              <p className="text-[10px] text-indigo-600 hover:underline mt-1.5 flex items-center gap-1 cursor-pointer">
                                <MapPin className="w-3 h-3" /> {act.locationName}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT PRE-TRIP CHECKS & REAL-TIME RECOVERY SIMULATION */}
      <div className="lg:col-span-4 space-y-6">

        {/* Active Journey Tracker & AI Recovery Agent */}
        {activeBooking && (
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-5" id="active-journey-tracker">
            <div className="flex items-center justify-between">
              <span className="text-[10px] bg-indigo-600 text-indigo-100 uppercase tracking-widest font-bold py-1 px-2.5 rounded-md">Live Travel Operations</span>
              <span className="text-xs font-mono text-slate-400 font-semibold">{activeBooking.id}</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">{activeBooking.destination} Active Package</h3>
              <p className="text-xs text-slate-400 mt-0.5">Scheduled block: {activeBooking.startDate}</p>
            </div>

            {/* Flight Monitoring Block */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Flight Status Monitor</span>
                <span className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded-full ${
                  activeBooking.flightStatus === 'Ontime' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                  activeBooking.flightStatus === 'Delayed' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse'
                }`}>
                  ● {activeBooking.flightStatus}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-300">{activeBooking.flightDetails}</p>
              
              {/* Hotel Monitoring Block */}
              <div className="border-t border-slate-700/60 pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400">Hotel: {activeBooking.hotelName}</span>
                <span className="text-emerald-400 font-bold uppercase">● Confirmed</span>
              </div>
            </div>

            {/* Alert Logs */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Operational Alerts</p>
              {activeBooking.alerts.map((alert, idx) => (
                <div key={idx} className="flex gap-2 text-xs bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/60 text-slate-300">
                  <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{alert}</span>
                </div>
              ))}
            </div>

            {/* Recovery Agent Demonstration triggers */}
            {activeBooking.flightStatus !== 'Cancelled' ? (
              <button 
                onClick={handleSimulateDisruption}
                className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                <span>Simulate Flight Cancellation (Test AI Disruption Agent)</span>
              </button>
            ) : (
              <div className="bg-rose-950/40 border border-rose-850 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Bot className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-white">AI Disruption Resolution Plan</h5>
                    <p className="text-[11px] text-slate-300 mt-0.5">Gemini automatically matched real-time flights & availability guides:</p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {activeBooking.recoveryOptions?.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleApplyRecovery(opt)}
                      className="w-full text-left p-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs rounded-lg font-medium border border-slate-700 transition-colors cursor-pointer block hover:border-indigo-500"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Packing suggestions and Pre-trip details */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4" id="pre-trip-checklist">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-500" /> Pre-Trip Concierge Helper
          </h4>
          
          <div className="space-y-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
              <p className="text-xs font-bold text-slate-800">Custom Visa Assessment</p>
              <p className="text-[11px] text-slate-600">Based on July 2026 guidelines, US/EU passport holders require no prepaid visa and receive 90-day visa-on-arrival exemption stamps.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
              <p className="text-xs font-bold text-slate-800">Interactive Packing Checklist</p>
              <div className="space-y-1 text-slate-600 text-[11px]">
                <p className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Global multi-way adapters (Type G/C)</p>
                <p className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Digital PDF copies of travel insurance documents</p>
                <p className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Warm thermal layer for evening mountain transit</p>
              </div>
            </div>
          </div>
        </div>

        {/* CHATBOT PANELS */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <div>
                <h4 className="text-xs font-bold">24/7 Travel Concierge</h4>
                <p className="text-[10px] text-slate-400">Powered by Gemini 3.5 Flash</p>
              </div>
            </div>
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
          </div>

          {/* Messages block */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-50/50">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-xl max-w-[85%] ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white font-medium rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-150 rounded-tl-none shadow-xs'
                }`}>
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-500 border border-slate-150 p-3 rounded-lg flex items-center gap-2 shadow-xs">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Form write */}
          <form onSubmit={sendChatMessage} className="p-3 border-t border-slate-100 flex gap-2 bg-white">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about flights delay, localized places, packing ideas..."
              className="flex-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100/70 text-xs rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button 
              type="submit" 
              className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>

      {/* EXPORT ITINERARY PRINT MODAL */}
      {showExportModal && activeItinerary && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                <Printer className="w-5 h-5 text-indigo-500" /> Printable Travel Summary
              </h3>
              <button 
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 hover:bg-slate-50 rounded"
              >
                ✕ Cancel
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 font-medium">
              <div className="border-l-4 border-indigo-600 pl-3">
                <h4 className="text-sm font-bold text-slate-950 uppercase">TravelGPT SaaS B2B Customer Portal Itinerary</h4>
                <p className="text-[11px] text-slate-500">Destination Recommendation: {activeItinerary.destination}</p>
                <p className="text-[11px] text-slate-500">Scheduled: {dates} / Budget target: ${activeItinerary.budget} USD</p>
                <p className="text-[11px] text-slate-500">Total Curated cost breakout: ${activeItinerary.totalCostEstimate} USD</p>
              </div>

              <div className="space-y-3">
                {activeItinerary.days.map((dy) => (
                  <div key={dy.day} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="font-bold text-slate-950">DAY {dy.day}: {dy.title}</p>
                    <div className="mt-1.5 space-y-1 pl-2">
                      {dy.activities.map((a, i) => (
                        <p key={i} className="text-[11px] text-slate-600">
                          <strong>{a.time}</strong> - {a.title} ({a.type}) {a.cost ? `($${a.cost})` : ''}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
              <button 
                onClick={() => { window.print(); }} 
                className="py-1.5 px-4 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
              >
                Trigger System Print Dialog
              </button>
              <button 
                onClick={() => setShowExportModal(false)} 
                className="py-1.5 px-3 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Dismiss PDF View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
