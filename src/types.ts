export interface ItineraryDay {
  day: number;
  title: string;
  activities: {
    time: string;
    type: 'flight' | 'hotel' | 'attraction' | 'restaurant' | 'transportation';
    title: string;
    description: string;
    cost?: number;
    locationName?: string;
  }[];
}

export interface Itinerary {
  id: string;
  destination: string;
  durationDays: number;
  budget: number;
  familySize: number;
  interests: string[];
  weatherEstimate: string;
  totalCostEstimate: number;
  days: ItineraryDay[];
}

export interface Lead {
  id: string;
  customerName: string;
  email: string;
  phone?: string;
  budget: number;
  destinations: string;
  notes?: string;
  status: 'New' | 'Qualified' | 'In Progress' | 'Booked' | 'Lost';
  assignedAgent?: string;
  createdAt: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  channel: 'Google Ads' | 'Meta' | 'Email' | 'Affiliate' | 'SEO';
  spend: number;
  revenue: number;
  conversions: number;
  clicks: number;
  roi: number;
}

export interface CustomerReview {
  id: string;
  author: string;
  platform: 'Google' | 'TripAdvisor' | 'Social Media';
  rating: number;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  status: 'Unresolved' | 'Resolved';
  date: string;
}

export interface InternalAgentConfig {
  id: string;
  name: string;
  role: string;
  model: string;
  temperature: number;
  systemInstruction: string;
  status: 'Active' | 'Inactive';
}

export interface ActiveBooking {
  id: string;
  customerName: string;
  destination: string;
  startDate: string;
  endDate: string;
  flightStatus: 'Ontime' | 'Delayed' | 'Cancelled';
  flightDetails?: string;
  hotelName: string;
  hotelStatus: 'Confirmed' | 'Pending';
  alerts: string[];
  recoveryOptions?: string[];
}
