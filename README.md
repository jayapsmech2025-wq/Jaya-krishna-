# National Water Intelligence Platform

An end-to-end Big Data platform for National Water Resource Management.

## Features
- **Real-time Dashboard**: Monitor reservoir levels, groundwater, rainfall, and soil moisture.
- **AI Forecasting**: 6-month predictive analysis using Gemini 3.1 Flash.
- **Big Data Pipeline**: Simulated ingestion, cleaning, and feature engineering.
- **Alert System**: Real-time drought and flood risk notifications.
- **Regional Visualization**: Interactive map and comparative charts.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Recharts, Lucide Icons, Framer Motion.
- **Backend**: Node.js (Express), Gemini API.
- **AI**: Google Gemini for predictive modeling and anomaly detection.

## How to Run
1. Ensure you have Node.js installed.
2. Run `npm install` to install dependencies.
3. Set your `GEMINI_API_KEY` in the environment or `.env` file.
4. Run `npm run dev` to start the full-stack application.
5. Access the dashboard at `http://localhost:3000`.

## Architecture
- `server.ts`: Express backend handling API routes and data pipeline simulation.
- `src/App.tsx`: React frontend with the dashboard UI.
- `src/lib/gemini.ts`: Integration with Gemini for forecasting and analysis.
