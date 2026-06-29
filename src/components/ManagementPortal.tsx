import React, { useState } from 'react';
import { 
  TrendingUp, DollarSign, Target, MessageSquare, Bot, AlertTriangle, 
  BarChart3, RefreshCw, Star, ShieldAlert, Sparkles, Check, Smile, Meh, Frown,
  LineChart as LineChartIcon, Palette
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { MarketingCampaign, CustomerReview } from '../types';

interface ManagementPortalProps {
  campaigns: MarketingCampaign[];
  reviews: CustomerReview[];
  onAddReview: (review: CustomerReview) => void;
  onUpdateReviewStatus: (reviewId: string, status: CustomerReview['status']) => void;
}

export default function ManagementPortal({
  campaigns,
  reviews,
  onAddReview,
  onUpdateReviewStatus
}: ManagementPortalProps) {
  // Forecasting parameters
  const [targetMargin, setTargetMargin] = useState(18);
  const [competitorOffsetPercent, setCompetitorOffsetPercent] = useState(-5);
  const [recomputing, setRecomputing] = useState(false);

  // Sentiment Filter state
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');

  // Trend Chart Theme 'Status Color' & Name Selection
  const [chartStatusColor, setChartStatusColor] = useState<'emerald' | 'indigo' | 'violet' | 'amber'>('emerald');
  const [customChartTitle, setCustomChartTitle] = useState('Campaign Revenue Yield History');

  // AI draft states
  const [draftingReviewId, setDraftingReviewId] = useState<string | null>(null);
  const [generatedDrafts, setGeneratedDrafts] = useState<Record<string, string>>({});

  // Simulated forecasting statistics
  const forecastsData = [
    { name: 'Jan', historical: 140, predicted: 140 },
    { name: 'Feb', historical: 165, predicted: 168 },
    { name: 'Mar', historical: 195, predicted: 190 },
    { name: 'Apr', historical: 130, predicted: 155 }, // The drop explained by Easter calendar shift
    { name: 'May', historical: 220, predicted: 240 },
    { name: 'Jun', historical: null, predicted: 310 }, // June/July peak projections
    { name: 'Jul', historical: null, predicted: 390 },
    { name: 'Aug', historical: null, predicted: 360 },
  ];

  const handleRecalculatePricing = () => {
    setRecomputing(true);
    setTimeout(() => {
      setRecomputing(false);
      alert("Dynamic revenue margins recalculated! Dynamic pricing strategy dispatched globally across B2C checkout and partner OTAs.");
    }, 1200);
  };

  // Generate automated reply using Gemini Chat API under the hood
  const handleAutoReply = async (review: CustomerReview) => {
    setDraftingReviewId(review.id);
    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Please write a highly polished, short professional business response to this traveler's review:
Author: "${review.author}"
Platform: "${review.platform}"
Rating: ${review.rating} Stars
Review content: "${review.content}"
Sentiment evaluated: "${review.sentiment}"

Draft a polite, supportive, and formal reply thanking them or offering high-grade resolutions. Start with "Dear ${review.author}," and keep it under 3 sentences.`,
        })
      });
      const data = await response.json();
      setGeneratedDrafts(prev => ({
        ...prev,
        [review.id]: data.text?.replace(/#{1,6}/g, '').trim() || "Thank you for sharing your experience with us. We deeply appreciate your feedback and strive to make every vacation exceptional."
      }));
    } catch (err) {
      console.error(err);
      setGeneratedDrafts(prev => ({
        ...prev,
        [review.id]: `Dear ${review.author}, thank you for your valuable feedback. Our hospitality team is dedicated to enhancing travelers' journeys under budget.`
      }));
    } finally {
      setDraftingReviewId(null);
    }
  };

  const handleResolveReview = (reviewId: string) => {
    onUpdateReviewStatus(reviewId, 'Resolved');
  };

  const filteredReviews = reviews.filter(r => {
    if (sentimentFilter === 'all') return true;
    return r.sentiment === sentimentFilter;
  });

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <Smile className="w-4 h-4 text-emerald-500" />;
      case 'neutral': return <Meh className="w-4 h-4 text-amber-500" />;
      default: return <Frown className="w-4 h-4 text-rose-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-12" id="management-analytics-root">
      
      {/* FORECASTING & REVENUE FORECAST DUAL MODULE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Dynamic Forecasting Graphical Analysis (Recharts implementation) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Predictive Bookings Analytics
                <span className="text-xs bg-indigo-100 text-indigo-800 py-0.5 px-2 rounded-full font-medium">Forecasting Agent</span>
              </h3>
              <p className="text-xs text-slate-500">Live booking progression comparing historical results against AI predictive algorithms (Easter shifts, June summer peaks)</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-indigo-100 rounded-xs"></span> Historical</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-indigo-600 rounded-xs"></span> AI Forecasted</span>
            </div>
          </div>

          {/* Recharts Graphical representation */}
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e0e7ff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#e0e7ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="historical" stroke="#818cf8" strokeWidth={1} fillOpacity={1} fill="url(#colorHistorical)" name="Historic Units" />
                <Area type="monotone" dataKey="predicted" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPredicted)" name="AI Target Forecast" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-center">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Pre-Summer Forecast</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">310 Packages</p>
              <span className="text-[9px] text-emerald-600 font-semibold">↑ 41.2% Month-over-Month</span>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Staff Guide Capacity</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">92.4% Allocated</p>
              <span className="text-[9px] text-amber-600 font-semibold">● Trigger Ops Agent Hires</span>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Peak Occupancy (July)</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">98.1% Proj.</p>
              <span className="text-[9px] text-emerald-600 font-semibold">↑ Top-tier efficiency</span>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Dynamic Pricing Rec.</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">+ 7.2% Yield</p>
              <span className="text-[9px] text-indigo-600 font-semibold">● Recommended by Bot</span>
            </div>
          </div>
        </div>

        {/* Dynamic Pricing optimization controls */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-[9px] bg-emerald-50 text-emerald-800 border-emerald-100 py-0.5 px-2.5 rounded-full font-bold uppercase tracking-wider">Dynamic Yield Optimization</span>
              <h3 className="text-lg font-bold text-slate-950 mt-1 tracking-tight">Revenue Management</h3>
              <p className="text-xs text-slate-500">Tune algorithms to increase average margin yield based on competitor activity levels</p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-750 mb-1">
                  <span>Target Gross Profit Margin</span>
                  <span className="font-bold text-indigo-600">{targetMargin}%</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="35" 
                  value={targetMargin} 
                  onChange={(e) => setTargetMargin(Number(e.target.value))} 
                  className="w-full accent-indigo-600 cursor-pointer" 
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-750 mb-1">
                  <span>Competitor Rate Offset</span>
                  <span className="font-bold text-amber-600">{competitorOffsetPercent}% undercutting</span>
                </div>
                <input 
                  type="range" 
                  min="-20" 
                  max="10" 
                  value={competitorOffsetPercent} 
                  onChange={(e) => setCompetitorOffsetPercent(Number(e.target.value))} 
                  className="w-full accent-amber-600 cursor-pointer" 
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-[11px] text-slate-650">
              <p>● Live competitor rates parsed through OTAs (Expedia/Booking) on June 2026.</p>
              <p>● Under high summer demands, we suggest keeping margins above <strong>{targetMargin + 3}%</strong> to capture peak demand without diminishing volume conversion ratios.</p>
            </div>
          </div>

          <button
            onClick={handleRecalculatePricing}
            disabled={recomputing}
            className="w-full mt-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            {recomputing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing live margin models...</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Deploy Margin Configurations</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* MARKETING CAMPAIGNS SEGMENTS SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="marketing-campaigns-dashboard">
        {/* Left: Campaigns metrics collection */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Target Marketing Campaigns & ROI Segment Analytics
                <span className="text-xs bg-indigo-100 text-indigo-800 py-0.5 px-2 rounded-full font-medium">Marketing Intelligence</span>
              </h3>
              <p className="text-xs text-slate-500">Track customer acquisition spend, dynamic clicks, and ultimate conversion return margins across standard channels</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-2">
              {campaigns.map((camp) => (
                <div key={camp.id} className="p-4 bg-slate-50/70 border border-slate-150 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-150/50 pb-2">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{camp.name}</span>
                    <span className="text-[9px] bg-slate-200 text-slate-600 font-mono py-0.5 px-1.5 rounded uppercase font-semibold shrink-0">{camp.channel}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Spend</span>
                      <span className="font-bold text-slate-700">${camp.spend.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Revenue</span>
                      <span className="font-bold text-indigo-600">${camp.revenue.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Conversions</span>
                      <span className="font-semibold text-slate-700">{camp.conversions}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">ROI Vibe</span>
                      <span className="font-black text-emerald-600">{camp.roi}x</span>
                    </div>
                  </div>

                  {/* Progress visual */}
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden animate-pulse">
                    <div 
                      className="bg-indigo-600 h-1 rounded-full transition-all" 
                      style={{ width: `${Math.min(100, camp.roi * 25)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Campaign Revenue Velocity line chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between" id="campaign-revenue-trend-chart">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <LineChartIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{customChartTitle}</span>
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Performance progression tracking dynamic marketing campaigns over chronological sequence and roi efficiency
              </p>
            </div>

            {/* Interactive Controller */}
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-150 space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Customize Chart Header Title</label>
                <input
                  type="text"
                  value={customChartTitle}
                  onChange={(e) => setCustomChartTitle(e.target.value)}
                  className="w-full text-xs py-1.5 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-semibold text-slate-800"
                  placeholder="Rename chart dynamic stream value"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Set Status Line Theme Tint</label>
                <div className="flex flex-wrap gap-2">
                  {(['emerald', 'indigo', 'violet', 'amber'] as const).map((color) => {
                    const colorThemes = {
                      emerald: { dot: 'bg-emerald-500', border: 'border-emerald-200 hover:border-emerald-350', active: 'border-emerald-600 text-emerald-800 bg-emerald-50/30' },
                      indigo: { dot: 'bg-indigo-600', border: 'border-indigo-200 hover:border-indigo-350', active: 'border-indigo-600 text-indigo-800 bg-indigo-50/30' },
                      violet: { dot: 'bg-violet-600', border: 'border-violet-200 hover:border-violet-350', active: 'border-violet-600 text-violet-800 bg-violet-50/30' },
                      amber: { dot: 'bg-amber-500', border: 'border-amber-200 hover:border-amber-350', active: 'border-amber-600 text-amber-800 bg-amber-50/30' },
                    };
                    const isSelected = chartStatusColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => setChartStatusColor(color)}
                        className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          isSelected ? colorThemes[color].active : `bg-white text-slate-600 ${colorThemes[color].border}`
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${colorThemes[color].dot}`} />
                        <span>{color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recharts LineChart Area */}
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={campaigns} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="id" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickFormatter={(value) => {
                      const item = campaigns.find(c => c.id === value);
                      return item ? item.channel : value;
                    }}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickFormatter={(value) => `$${(value / 1000)}k`}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                    formatter={(value: any) => [`$${value.toLocaleString()}`, "Campaign Revenue"]}
                    labelFormatter={(label) => {
                      const item = campaigns.find(c => c.id === label);
                      return item ? `${item.name} (${item.channel})` : `Campaign ${label}`;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={
                      chartStatusColor === 'emerald' ? '#10b981' :
                      chartStatusColor === 'indigo' ? '#4f46e5' :
                      chartStatusColor === 'violet' ? '#7c3aed' :
                      '#f59e0b'
                    }
                    strokeWidth={3} 
                    dot={(dotProps) => {
                      const { cx, cy, payload } = dotProps;
                      if (!cx || !cy) return null;
                      // Dynamic status indicator dot based on the individual ROI efficiency
                      const isHighProfit = payload.roi >= 5.0;
                      const isMediumProfit = payload.roi >= 3.0;
                      const pointColor = isHighProfit ? '#10b981' : isMediumProfit ? '#4f46e5' : '#f59e0b';
                      return (
                        <circle 
                          key={`dot-${payload.id}`} 
                          cx={cx} 
                          cy={cy} 
                          r={5} 
                          fill={pointColor} 
                          stroke="#ffffff" 
                          strokeWidth={2}
                          className="hover:scale-125 transition-transform cursor-pointer"
                        />
                      );
                    }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold gap-2 flex-wrap">
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full animate-ping ${
                chartStatusColor === 'emerald' ? 'bg-emerald-500' :
                chartStatusColor === 'indigo' ? 'bg-indigo-500' :
                chartStatusColor === 'violet' ? 'bg-violet-500' :
                'bg-amber-500'
              }`}></span>
              <span className="capitalize">{chartStatusColor} Track State Active</span>
            </span>
            <div className="flex gap-2">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Pro &gt;= 5.0x
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Mid &gt;= 3.0x
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Reg &lt; 3.0x
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS INTEGRATION & SENTIMENT INTELLIGENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="reviews-sentiment-dashboard">
        <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Customer Reviews Sentiment Intelligence
                <span className="text-xs bg-indigo-100 text-indigo-800 py-0.5 px-2 rounded-full font-medium">B2C Reputation</span>
              </h3>
              <p className="text-xs text-slate-500">Reputation tracking board monitoring Google and TripAdvisor feedback. Automatically flag grievances or generate draft replies with Gemini.</p>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-1.5 text-xs">
              {(['all', 'positive', 'neutral', 'negative'] as const).map((sent) => (
                <button
                  key={sent}
                  onClick={() => setSentimentFilter(sent)}
                  className={`py-1.5 px-3 rounded-lg border text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    sentimentFilter === sent 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {sent}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback details */}
          <div className="space-y-4">
            {filteredReviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-slate-50/55 hover:bg-slate-50 rounded-xl border border-slate-150 transition-all flex flex-col md:flex-row gap-4 items-start justify-between">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-slate-900">{rev.author}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-200 py-0.5 px-1.5 rounded font-medium">{rev.platform}</span>
                    <span className="text-[10px] font-semibold text-slate-400">{rev.date}</span>
                    <span className="flex items-center gap-0.5 text-xs text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star key={idx} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-650 italic font-medium">"{rev.content}"</p>

                  {/* AI Generated response displayed */}
                  {generatedDrafts[rev.id] && (
                    <div className="mt-4 p-3 bg-indigo-50 border border-indigo-150 text-indigo-900 text-xs rounded-lg space-y-1">
                      <p className="font-bold flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5 text-indigo-600" /> Automated AI Response Draft (Pending Approval):
                      </p>
                      <p className="italic">"{generatedDrafts[rev.id]}"</p>
                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          onClick={() => {
                            alert(`Response dispatched successfully to traveler's platform page.`);
                            handleResolveReview(rev.id);
                          }}
                          className="px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded hover:bg-indigo-700 cursor-pointer flex items-center gap-0.5"
                        >
                          <Check className="w-3 h-3" /> Approve & Publish
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:items-end gap-2 shrink-0 h-full justify-between">
                  {/* Sentiment and Status displays */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 bg-white border border-slate-150 py-0.5 px-2 rounded-md font-semibold text-slate-700">
                      {getSentimentIcon(rev.sentiment)}
                      <span className="capitalize text-[10px]">{rev.sentiment}</span>
                    </span>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rev.status === 'Resolved' 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                        : 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse'
                    }`}>
                      {rev.status}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {/* Trigger Gemini draft AI assistance */}
                    {rev.status === 'Unresolved' && (
                      <button
                        onClick={() => handleAutoReply(rev)}
                        disabled={draftingReviewId === rev.id}
                        className="py-1 px-2.5 bg-slate-900 hover:bg-black disabled:bg-slate-400 text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {draftingReviewId === rev.id ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Drafting...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            <span>GenAI Auto-draft response</span>
                          </>
                        )}
                      </button>
                    )}
                    {rev.status === 'Unresolved' && (
                      <button
                        onClick={() => handleResolveReview(rev.id)}
                        className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer"
                      >
                        Resolve Manual
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
