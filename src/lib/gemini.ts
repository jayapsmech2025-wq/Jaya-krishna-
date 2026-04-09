import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI
// Note: process.env.GEMINI_API_KEY is automatically injected by the platform
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function getWaterForecast(sensorData: any) {
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. Using fallback data.");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are a hydrological expert. Analyze the following regional water sensor data and provide a 6-month forecast.
        Data: ${JSON.stringify(sensorData)}
        
        Return a JSON object with:
        - region: string
        - forecast: array of { month: string, water_availability: number (0-100), risk: "LOW" | "MEDIUM" | "HIGH" }
        - summary: string (brief explanation)
        - alerts: array of { type: "DROUGHT" | "FLOOD", severity: "WARNING" | "CRITICAL", message: string }
      `,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Forecast Error:", error);
    return null;
  }
}

export async function detectAnomalies(sensorData: any) {
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. No anomalies detected.");
    return { anomalies: [] };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze this sensor data for anomalies or extreme weather patterns.
        Data: ${JSON.stringify(sensorData)}
        
        Return a JSON object with:
        - anomalies: array of { parameter: string, value: number, reason: string, severity: "LOW" | "MEDIUM" | "HIGH" }
      `,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Anomaly Error:", error);
    return { anomalies: [] };
  }
}
