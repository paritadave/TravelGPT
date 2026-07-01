import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  console.log("Gemini client successfully initialized server-side.");
} else {
  console.warn("GEMINI_API_KEY is not defined in environment variables. Running in mock AI mode.");
}

// -------------------------------------------------------------
// Robust Multi-Model Fallback & Retry Helpers
// Helps bypass upstream 503 (model overloaded) and 429 rate limit issues
// -------------------------------------------------------------
async function generateContentWithFallback(params: any): Promise<any> {
  const primaryModel = params.model || "gemini-3.5-flash";
  const backupModels = ["gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];
  const allModels = [primaryModel, ...backupModels.filter(m => m !== primaryModel)];
  
  let lastError: any = null;
  for (const model of allModels) {
    try {
      console.log(`[Gemini API] Querying content with model: ${model}`);
      return await ai!.models.generateContent({
        ...params,
        model: model
      });
    } catch (error: any) {
      console.warn(`[Gemini API] Prompt query failed with model ${model}:`, error.message || error);
      lastError = error;
    }
  }
  throw lastError;
}

async function sendChatMessageWithFallback(
  formattedHistory: any[],
  finalPrompt: string,
  systemInstruction: string
): Promise<any> {
  const models = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];
  let lastError: any = null;

  for (const model of models) {
    try {
      console.log(`[Gemini API] Creating chat session using model: ${model}`);
      const chatInstance = ai!.chats.create({
        model: model,
        config: {
          systemInstruction: systemInstruction,
        },
        history: formattedHistory,
      });
      return await chatInstance.sendMessage({ message: finalPrompt });
    } catch (error: any) {
      console.warn(`[Gemini API] Chat message failed under model ${model}:`, error.message || error);
      lastError = error;
    }
  }
  throw lastError;
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 0. Configuration check endpoint to verify server-side keys
app.get("/api/config", (req, res) => {
  res.json({ hasApiKey: !!process.env.GEMINI_API_KEY });
});

// 1. Discovery / Itinerary Generator endpoint (Structured JSON output)
app.post("/api/gemini/inspire", async (req, res) => {
  const { budget, dates, familySize, interests, notes, preferredWeather } = req.body;

  if (!ai) {
    return res.status(200).json(getFallbackItinerary(budget, familySize, interests));
  }

  try {
    const prompt = `Generate an inspiring end-to-end trip itinerary for a family vacation with the following details:
- Budget: $${budget || 5000}
- Dates: ${dates || "July 2026"}
- Family Size: ${familySize || 4} peoples
- Preferred Weather: ${preferredWeather || "Sunny and warm"}
- Interests: ${interests ? interests.join(", ") : "beaches, culture, food"}
- Additional Notes: ${notes || "None"}

Please choose a specific destination that best fits these criteria. Organize the total estimated cost such that the total sum doesn't exceed $${budget || 5000}. Output exactly according to the schema.`;

    const response = await generateContentWithFallback({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite AI Destination Finder & Trip Planner for travel agencies. Your goal is to choose a world-class travel destination fitting the user criteria and design a highly descriptive, feasible day-by-day vacation itinerary with flights, hotels, key attractions, restaurants, and relative cost breakouts. Strictly follow the JSON output schema provided.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            destination: { type: Type.STRING, description: "City and Country of recommendation" },
            durationDays: { type: Type.INTEGER, description: "Number of days (suggest between 3 to 5 days)" },
            budget: { type: Type.NUMBER, description: "Total budget requested" },
            familySize: { type: Type.INTEGER },
            interests: { type: Type.ARRAY, items: { type: Type.STRING } },
            weatherEstimate: { type: Type.STRING, description: "Short description of expected weather in that region during dates" },
            totalCostEstimate: { type: Type.NUMBER, description: "Realistic sum of all flights, lodging, attractions, and foods" },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  title: { type: Type.STRING, description: "Summary title of the day's theme" },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        time: { type: Type.STRING, description: "Time of day (e.g. 09:00 AM, Evening)" },
                        type: { type: Type.STRING, description: "Must be exactly one of: 'flight', 'hotel', 'attraction', 'restaurant', 'transportation'" },
                        title: { type: Type.STRING, description: "Activity name" },
                        description: { type: Type.STRING, description: "Descriptive detail of the activity" },
                        cost: { type: Type.NUMBER, description: "Average estimated cost in USD" },
                        locationName: { type: Type.STRING, description: "Specific location name or address" }
                      },
                      required: ["time", "type", "title", "description"]
                    }
                  }
                },
                required: ["day", "title", "activities"]
              }
            }
          },
          required: ["destination", "durationDays", "budget", "familySize", "interests", "weatherEstimate", "totalCostEstimate", "days"]
        }
      }
    });

    const bodyText = response.text?.trim() || "";
    const cleanJson = JSON.parse(bodyText);
    res.json(cleanJson);
  } catch (error: any) {
    console.error("Gemini inspire error:", error);
    // Respond with a structured fallback on error path
    res.json(getFallbackItinerary(budget, familySize, interests));
  }
});

// 2. Chat API endpoint (general AI Assistant, supports simple prompt and history)
app.post("/api/gemini/chat", async (req, res) => {
  const { message, history, context } = req.body;

  if (!ai) {
    return res.json({
      text: `[Offline Mode] Hello! We're running without a live GEMINI_API_KEY. To help answer your question: "${message}", please add a real key in settings. For now: Happy travels to your dream location under budget!`
    });
  }

  try {
    const formattedHistory = (history || []).map((chat: any) => ({
      role: chat.role === "user" ? "user" : "model",
      parts: [{ text: chat.text }]
    }));

    // Add immediate context to guide the prompt
    const finalPrompt = context 
      ? `System Active Context:\n${JSON.stringify(context)}\n\nUser Question: ${message}`
      : message;

    const response = await sendChatMessageWithFallback(
      formattedHistory,
      finalPrompt,
      "You are TravelGPT's core Virtual Assistance concierge. You support customers in scheduling support, detailing flight updates, providing packing suggestions, dynamic localized restaurant ideas, custom visa requirements, and travel delay rebooking options. Give practical, high-value B2B SaaS target feedback, using beautiful Markdown headings, lists, and bold callouts to structure responses."
    );
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini chat error:", error);
    res.status(500).json({ error: error.message || "Failed to generate chat response" });
  }
});

// 3. Executive Copilot endpoint
app.post("/api/gemini/copilot", async (req, res) => {
  const { question, databaseSummary } = req.body;

  if (!ai) {
    return res.json({
      text: `##### 📊 Executive Copilot Insights (Fallback Mode)
You asked: "${question}"

**Key Analysis Highlights**:
- April booking decline was simulated to be influenced by an early Easter holiday occurring in late March, compressing shoulder season flights.
- Our dynamic revenue model predicts adding premium eco tour tiers to June bookings could recoup the margins by **14.2%**.
- Staff utilization is current peak load at **92.3%** in Rome and Paris packages. Recommend adding seasonal guides. (Live Gemini key is missing, add in panel for deep-learning analysis).`
    });
  }

  try {
    const prompt = `Analyze this B2B SaaS travel operational database context to answer the Executive request:
Database States: ${JSON.stringify(databaseSummary)}

Executive Question: "${question}"

Respond with custom professional insights, metrics validation, forecasting graphs interpretation and clear suggestions. Present the results in styled corporate format with bold headings and structured bullet-points.`;

    const response = await generateContentWithFallback({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the TravelGPT Executive Copilot. You are an expert revenue analyst, chief operating officer assistant, and marketing strategist. Use actual facts in the provided JSON dataset summaries to formulate highly professional, data-backed strategic recommendations. Maintain a sharp, executive-level tone.",
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini copilot error:", error);
    res.status(500).json({ error: error.message || "Executive analytics failed" });
  }
});

// -------------------------------------------------------------
// Fallback Itinerary Generator (When key is missing or model throws)
// -------------------------------------------------------------
function getFallbackItinerary(budget: any, familySize: any, interests: any[]): any {
  const chosenDest = "Mallorca, Spain";
  const numDays = 4;
  const currentBudget = Number(budget) || 5000;
  
  return {
    destination: chosenDest,
    durationDays: numDays,
    budget: currentBudget,
    familySize: Number(familySize) || 4,
    interests: interests || ["beach", "culture"],
    weatherEstimate: "Sunny, high about 84°F (29°C). Perfect Mediterranean beach weather.",
    totalCostEstimate: Math.round(currentBudget * 0.88),
    days: [
      {
        day: 1,
        title: "Arrival & Coastal Exploration",
        activities: [
          {
            time: "11:00 AM",
            type: "flight",
            title: "Arrive at Palma de Mallorca Airport (PMI)",
            description: "Direct flight landing smoothly with premium coastal views.",
            cost: Math.round(currentBudget * 0.35),
            locationName: "Palma de Mallorca Airport, Spain"
          },
          {
            time: "02:30 PM",
            type: "hotel",
            title: "Check-in at Iberostar Selection Llaut Palma",
            description: "Beachfront lodging with direct access to bayside restaurants.",
            cost: Math.round(currentBudget * 0.22),
            locationName: "Llaut Palma Boulevard"
          },
          {
            time: "07:00 PM",
            type: "restaurant",
            title: "Sunset Tapas Dinner at El Camino Palma",
            description: "Fresh local seafood tapas, family styled.",
            cost: 160,
            locationName: "Carrer de Can Brondo, 4, Palma"
          }
        ]
      },
      {
        day: 2,
        title: "Sailing & Historic Cathedrals",
        activities: [
          {
            time: "09:30 AM",
            type: "attraction",
            title: "La Seu - Cathedral of Santa Maria Tour",
            description: "Skip-the-line group ticket for the world-renowned Gothic cathedral overlooking the harbor.",
            cost: 80,
            locationName: "Plaça de la Seu, s/n, 07001 Palma"
          },
          {
            time: "01:30 PM",
            type: "transportation",
            title: "Scenic Train to Sóller",
            description: "Vintage narrow-gauge wooden train ride exploring tunnels and orange valley mountain peaks.",
            cost: 120,
            locationName: "Palma Vintage Rail Station"
          }
        ]
      },
      {
        day: 3,
        title: "Snorkeling Cruise & Coves",
        activities: [
          {
            time: "09:00 AM",
            type: "attraction",
            title: "Private Catamaran Charter to Caló des Moro",
            description: "Explore the hidden turquoise coves of Mallorca, including gear for deep water snorkeling, paddleboarding, and on-board family BBQ lunch.",
            cost: Math.round(currentBudget * 0.15),
            locationName: "Marina Palma Charter Dock"
          }
        ]
      },
      {
        day: 4,
        title: "Artistic Valldemossa & Departure",
        activities: [
          {
            time: "10:00 AM",
            type: "attraction",
            title: "Explore Carthusian Monastery of Valldemossa",
            description: "Village stroll in the high Tramuntana mountains, tracing Chopin and George Sand's winter retreat.",
            cost: 65,
            locationName: "Valldemossa Village Center"
          },
          {
            time: "05:00 PM",
            type: "flight",
            title: "Return Flight Check-in",
            description: "Palma de Mallorca Airport departure board clearance.",
            cost: 0,
            locationName: "Palma de Mallorca Departure Lounge"
          }
        ]
      }
    ]
  };
}

// -------------------------------------------------------------
// Vite Express integration
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite asset-serving middleware
    app.use(vite.middlewares);
  } else {
    // Production state serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[TravelGPT APP] Host running at http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
