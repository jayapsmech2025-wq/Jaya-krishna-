import React, { useState, useEffect } from "react";
import { 
  Droplets, 
  Waves, 
  CloudRain, 
  Thermometer, 
  AlertTriangle, 
  Activity, 
  Map as MapIcon,
  BarChart3,
  Bell,
  Search,
  Menu,
  Wind,
  Database,
  TrendingUp,
  LogIn,
  LogOut
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "./components/FirebaseProvider";

// Types
interface SensorData {
  region: string;
  reservoir_level: number;
  groundwater_level: number;
  rainfall: number;
  river_flow: number;
  soil_moisture: number;
  temperature: number;
  humidity: number;
  evaporation: number;
  timestamp: string;
}

interface ForecastData {
  month: string;
  water_availability: number;
  risk: string;
}

interface Alert {
  id: number;
  type: string;
  region: string;
  severity: string;
  message: string;
  timestamp: string;
}

export default function App() {
  const { user, login, logout, loading: authLoading } = useAuth();
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("Central");
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sensorRes, alertRes] = await Promise.all([
          fetch("/api/sensors"),
          fetch("/api/alerts")
        ]);
        const sensorData = await sensorRes.json();
        const alertData = await alertRes.json();
        
        setSensors(sensorData);
        setAlerts(alertData);
        
        // Fetch forecast for initial region
        const forecastRes = await fetch(`/api/forecast?region=${selectedRegion}`);
        const forecastData = await forecastRes.json();
        setForecast(forecastData.forecast);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedRegion]);

  const currentData = sensors.find(s => s.region === selectedRegion) || sensors[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Initializing Water Intelligence Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-950 text-slate-200 font-sans selection:bg-brand-purple/30">
      {/* Sidebar / Navigation */}
      <nav className="fixed left-0 top-0 bottom-0 w-20 bg-brand-900 border-r border-brand-800 flex flex-col items-center py-8 gap-8 z-50">
        <div className="w-12 h-12 bg-gradient-to-br from-brand-purple to-brand-blue rounded-xl flex items-center justify-center shadow-lg shadow-brand-purple/20">
          <Droplets className="text-white w-7 h-7" />
        </div>
        <div className="flex flex-col gap-6 mt-8">
          <NavItem icon={<Activity className="w-6 h-6" />} active />
          <NavItem icon={<MapIcon className="w-6 h-6" />} />
          <NavItem icon={<BarChart3 className="w-6 h-6" />} />
          <NavItem icon={<Database className="w-6 h-6" />} />
        </div>
        <div className="mt-auto">
          <NavItem icon={<Bell className="w-6 h-6" />} />
        </div>
      </nav>

      {/* Main Content */}
      <main className="pl-20">
        {/* Header */}
        <header className="h-20 border-b border-brand-800 flex items-center justify-between px-8 sticky top-0 glass-brand z-40">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Smart Water <span className="text-brand-accent text-glow-purple">Grid</span>
            </h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Real-time Resource Management</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search regions..." 
                className="bg-slate-900 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 w-64 transition-all"
              />
            </div>
            
            {user ? (
              <div className="flex items-center gap-3 bg-brand-800 p-1 rounded-full border border-brand-700">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ""} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center text-xs font-bold text-white">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                  </div>
                )}
                <span className="text-sm font-medium pr-1 text-white">{user.displayName || "User"}</span>
                <button onClick={logout} className="p-2 hover:bg-brand-700 rounded-full text-slate-400 hover:text-red-400 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={login}
                className="flex items-center gap-2 bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90 text-white px-4 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-brand-purple/20"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Top Stats & Region Selector */}
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex gap-2 p-1 bg-brand-900 rounded-lg border border-brand-800">
              {sensors.map(s => (
                <button
                  key={s.region}
                  onClick={() => setSelectedRegion(s.region)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedRegion === s.region 
                      ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-brand-800"
                  }`}
                >
                  {s.region}
                </button>
              ))}
            </div>
            
            <div className="flex gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-brand-purple/10 border border-brand-purple/20 rounded-lg text-brand-accent text-sm font-medium">
                <div className="w-2 h-2 rounded-full bg-brand-purple animate-pulse"></div>
                System Online
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-brand-900 border border-brand-800 rounded-lg text-slate-400 text-sm font-medium">
                Last Sync: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
              title="Reservoir Level" 
              value={`${currentData.reservoir_level.toFixed(1)}%`} 
              icon={<Waves className="text-brand-blue" />} 
              trend="+2.4%" 
              color="blue"
            />
            <MetricCard 
              title="Groundwater" 
              value={`${currentData.groundwater_level.toFixed(1)}m`} 
              icon={<Droplets className="text-brand-purple" />} 
              trend="-0.8%" 
              color="purple"
              negative
            />
            <MetricCard 
              title="Avg Rainfall" 
              value={`${currentData.rainfall.toFixed(0)}mm`} 
              icon={<CloudRain className="text-brand-cyan" />} 
              trend="+12%" 
              color="cyan"
            />
            <MetricCard 
              title="Soil Moisture" 
              value={`${currentData.soil_moisture.toFixed(1)}%`} 
              icon={<Wind className="text-brand-accent" />} 
              trend="+0.5%" 
              color="accent"
            />
          </div>

          {/* Main Visualization Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Regional Map Visualization */}
            <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 shadow-xl flex flex-col overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-purple/10 transition-colors"></div>
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                  <h3 className="text-lg font-bold text-white">Regional Overview</h3>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Interactive Geographic Data</p>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 bg-brand-purple/10 rounded text-[10px] font-bold text-brand-purple border border-brand-purple/20">
                  <MapIcon className="w-3 h-3" />
                  LIVE MAP
                </div>
              </div>
              
              <div className="flex-1 flex items-center justify-center relative min-h-[300px] z-10">
                <svg viewBox="0 0 200 220" className="w-full h-full max-w-[280px]">
                  {/* Background Grid/Topography */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(168, 85, 247, 0.05)" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="200" height="220" fill="url(#grid)" />
                  
                  {/* Map Paths */}
                  <RegionPath 
                    d="M50 20 L150 20 L180 80 L100 100 L20 80 Z" 
                    name="North" 
                    selected={selectedRegion === "North"} 
                    onClick={() => setSelectedRegion("North")}
                    level={sensors.find(s => s.region === "North")?.reservoir_level}
                  />
                  <RegionPath 
                    d="M20 80 L100 100 L100 180 L20 180 Z" 
                    name="West" 
                    selected={selectedRegion === "West"} 
                    onClick={() => setSelectedRegion("West")}
                    level={sensors.find(s => s.region === "West")?.reservoir_level}
                  />
                  <RegionPath 
                    d="M100 100 L180 80 L180 180 L100 180 Z" 
                    name="East" 
                    selected={selectedRegion === "East"} 
                    onClick={() => setSelectedRegion("East")}
                    level={sensors.find(s => s.region === "East")?.reservoir_level}
                  />
                  <RegionPath 
                    d="M60 60 L140 60 L140 140 L60 140 Z" 
                    name="Central" 
                    selected={selectedRegion === "Central"} 
                    onClick={() => setSelectedRegion("Central")}
                    level={sensors.find(s => s.region === "Central")?.reservoir_level}
                  />
                  <RegionPath 
                    d="M20 180 L100 180 L180 180 L150 220 L50 220 Z" 
                    name="South" 
                    selected={selectedRegion === "South"} 
                    onClick={() => setSelectedRegion("South")}
                    level={sensors.find(s => s.region === "South")?.reservoir_level}
                  />

                  {/* Region Markers */}
                  <MapMarker x={100} y={40} active={selectedRegion === "North"} onClick={() => setSelectedRegion("North")} label="North" />
                  <MapMarker x={50} y={130} active={selectedRegion === "West"} onClick={() => setSelectedRegion("West")} label="West" />
                  <MapMarker x={150} y={130} active={selectedRegion === "East"} onClick={() => setSelectedRegion("East")} label="East" />
                  <MapMarker x={100} y={100} active={selectedRegion === "Central"} onClick={() => setSelectedRegion("Central")} label="Central" />
                  <MapMarker x={100} y={200} active={selectedRegion === "South"} onClick={() => setSelectedRegion("South")} label="South" />
                </svg>
                
                {/* Map Legend */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-tighter bg-brand-950/50 backdrop-blur-sm p-2 rounded-lg border border-brand-800/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                    <span>Scarcity (&lt;30%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-purple shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
                    <span>Optimal (&gt;70%)</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-brand-800 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Selected Region</span>
                    <span className="text-white font-bold text-lg">{selectedRegion}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Avg. Level</span>
                    <span className={`font-bold text-lg ${
                      (sensors.find(s => s.region === selectedRegion)?.reservoir_level || 0) < 30 ? 'text-red-400' : 'text-brand-accent'
                    }`}>
                      {sensors.find(s => s.region === selectedRegion)?.reservoir_level.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Forecast Chart */}
            <div className="lg:col-span-2 bg-brand-900 border border-brand-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-white">6-Month Water Availability Forecast</h3>
                  <p className="text-sm text-slate-400">Predictive analysis for {selectedRegion} Region</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-brand-purple"></div>
                    <span className="text-xs text-slate-400">Availability</span>
                  </div>
                  <TrendingUp className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecast}>
                    <defs>
                      <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d1266" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      stroke="#8892b0" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#8892b0" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f0720', border: '1px solid #2d1266', borderRadius: '12px' }}
                      itemStyle={{ color: '#a855f7' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="water_availability" 
                      stroke="#a855f7" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorWater)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Alerts Panel */}
            <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Risk Alerts</h3>
                <span className="px-2 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold rounded uppercase tracking-wider">Live</span>
              </div>
              
              <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {alerts.map(alert => (
                  <div 
                    key={alert.id} 
                    className={`p-4 rounded-xl border ${
                      alert.severity === 'CRITICAL' 
                        ? 'bg-red-500/5 border-red-500/20' 
                        : 'bg-amber-500/5 border-amber-500/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            alert.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'
                          }`}>
                            {alert.type} - {alert.severity}
                          </span>
                          <span className="text-[10px] text-slate-600">
                            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 font-medium leading-tight">{alert.message}</p>
                        <p className="text-[10px] text-slate-500 mt-2">Region: {alert.region}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="mt-auto w-full py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-700">
                View All Incident Logs
              </button>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Environmental Factors */}
            <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6">Environmental Factors</h3>
              <div className="grid grid-cols-2 gap-6">
                <FactorItem label="Temperature" value={`${currentData.temperature.toFixed(1)}°C`} icon={<Thermometer className="w-4 h-4 text-orange-400" />} />
                <FactorItem label="Humidity" value={`${currentData.humidity.toFixed(0)}%`} icon={<Activity className="w-4 h-4 text-brand-blue" />} />
                <FactorItem label="Evaporation" value={`${currentData.evaporation.toFixed(1)}mm/d`} icon={<Wind className="w-4 h-4 text-slate-400" />} />
                <FactorItem label="River Flow" value={`${currentData.river_flow.toFixed(0)}m³/s`} icon={<Waves className="text-brand-purple w-4 h-4" />} />
              </div>
            </div>

            {/* Regional Comparison */}
            <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6">Regional Reservoir Status</h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sensors}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d1266" vertical={false} />
                    <XAxis dataKey="region" stroke="#8892b0" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#8892b0" fontSize={10} tickLine={false} axisLine={false} hide />
                    <Tooltip 
                      cursor={{ fill: '#2d1266' }}
                      contentStyle={{ backgroundColor: '#0f0720', border: '1px solid #2d1266', borderRadius: '12px' }}
                    />
                    <Bar dataKey="reservoir_level" radius={[4, 4, 0, 0]}>
                      {sensors.map((entry, index) => {
                        // Calculate grayscale color based on level (0-100)
                        // 0% = Black (#000000), 100% = White (#ffffff)
                        const brightness = Math.floor((entry.reservoir_level / 100) * 255);
                        const color = `rgb(${brightness}, ${brightness}, ${brightness})`;
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={color}
                            stroke={entry.region === selectedRegion ? '#a855f7' : 'none'}
                            strokeWidth={2}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, active = false }: { icon: React.ReactNode; active?: boolean }) {
  return (
    <button className={`p-3 rounded-xl transition-all ${
      active 
        ? "bg-brand-purple/10 text-brand-purple border border-brand-purple/20" 
        : "text-slate-500 hover:text-slate-300 hover:bg-brand-800"
    }`}>
      {icon}
    </button>
  );
}

function MetricCard({ title, value, icon, trend, color, negative = false }: any) {
  const colors: any = {
    blue: "bg-brand-blue/10 text-brand-blue",
    purple: "bg-brand-purple/10 text-brand-purple",
    cyan: "bg-brand-cyan/10 text-brand-cyan",
    accent: "bg-brand-accent/10 text-brand-accent",
  };

  return (
    <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 shadow-lg hover:border-brand-purple/30 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        <div className={`text-[10px] font-bold px-2 py-1 rounded ${
          negative ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
        }`}>
          {trend}
        </div>
      </div>
      <h4 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</h4>
      <p className="text-2xl font-bold text-white group-hover:text-brand-purple transition-colors">{value}</p>
    </div>
  );
}

function FactorItem({ label, value, icon }: any) {
  return (
    <div className="flex items-center gap-4 p-4 bg-brand-800/50 rounded-xl border border-brand-800/50 hover:bg-brand-800 transition-colors">
      <div className="p-2 bg-brand-900 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function RegionPath({ d, name, selected, onClick, level = 50 }: any) {
  // Color based on water level
  const fill = level < 30 ? `rgba(239, 68, 68, ${0.3 + (1 - level/100) * 0.4})` : `rgba(168, 85, 247, ${0.1 + (level/100) * 0.4})`;
  const stroke = selected ? "#c084fc" : "#4c1d95";
  
  return (
    <motion.path
      d={d}
      initial={false}
      animate={{ 
        fill, 
        stroke, 
        strokeWidth: selected ? 3 : 1,
        scale: selected ? 1.02 : 1,
        filter: selected ? "drop-shadow(0 0 8px rgba(168, 85, 247, 0.4))" : "none"
      }}
      transition={{ duration: 0.3 }}
      className="cursor-pointer hover:opacity-90"
      onClick={onClick}
    >
      <title>{name}: {level.toFixed(1)}%</title>
    </motion.path>
  );
}

function MapMarker({ x, y, active, onClick, label }: any) {
  return (
    <g 
      className="cursor-pointer" 
      onClick={onClick}
      transform={`translate(${x}, ${y})`}
    >
      <motion.circle
        r={active ? 6 : 4}
        fill={active ? "#c084fc" : "#4c1d95"}
        stroke="#0f0720"
        strokeWidth={1}
        animate={active ? { scale: [1, 1.5, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
      />
      {active && (
        <motion.circle
          r={12}
          fill="none"
          stroke="#c084fc"
          strokeWidth={1}
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}
      <text
        y={-10}
        textAnchor="middle"
        className={`text-[8px] font-bold uppercase tracking-tighter fill-slate-400 pointer-events-none ${active ? 'fill-brand-accent' : ''}`}
      >
        {label}
      </text>
    </g>
  );
}

