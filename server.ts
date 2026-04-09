import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Data Pipeline Simulation
  const processDataPipeline = (rawData: any) => {
    // Simulate cleaning and feature engineering
    const cleanedData = rawData.map((d: any) => ({
      ...d,
      processed_at: new Date().toISOString(),
      water_index: (d.reservoir_level * 0.4) + (d.groundwater_level * 0.3) + (d.soil_moisture * 0.3)
    }));
    
    return { cleanedData };
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Smart Water Grid" });
  });

  app.get("/api/sensors", (req, res) => {
    const regions = ["North", "South", "East", "West", "Central"];
    const rawData = regions.map(region => ({
      region,
      reservoir_level: 20 + Math.random() * 60,
      groundwater_level: 10 + Math.random() * 30,
      rainfall: Math.random() * 150,
      river_flow: 50 + Math.random() * 400,
      soil_moisture: 30 + Math.random() * 50,
      temperature: 18 + Math.random() * 15,
      humidity: 50 + Math.random() * 30,
      evaporation: 2 + Math.random() * 5,
      timestamp: new Date().toISOString()
    }));

    const { cleanedData } = processDataPipeline(rawData);
    res.json(cleanedData);
  });

  app.get("/api/forecast", (req, res) => {
    const region = req.query.region as string || "Central";
    
    // Fallback mock data
    const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
    res.json({
      region,
      forecast: months.map((month, i) => ({
        month,
        water_availability: 70 - (i * 3) + (Math.random() * 10),
        risk: i > 3 ? "MEDIUM" : "LOW"
      })),
      summary: "Seasonal decline expected during summer months."
    });
  });

  app.get("/api/alerts", (req, res) => {
    res.json([
      { id: 1, type: "DROUGHT", region: "South Zone", severity: "CRITICAL", message: "Reservoir levels below 15% in South Zone. Immediate conservation required.", timestamp: new Date().toISOString() },
      { id: 2, type: "FLOOD", region: "North Zone", severity: "WARNING", message: "River flow exceeding safety thresholds. Monitoring upstream discharge.", timestamp: new Date().toISOString() },
      { id: 3, type: "ANOMALY", region: "West Zone", severity: "LOW", message: "Unusual soil moisture drop detected in agricultural sector.", timestamp: new Date().toISOString() }
    ]);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
