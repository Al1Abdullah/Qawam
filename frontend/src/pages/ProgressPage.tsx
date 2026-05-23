import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronLeft, Flame, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { storage } from '../services/storage';

const ProgressPage = () => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const navigate = useNavigate();
  const userId = storage.getUserId();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await apiService.getHistory(userId);
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for visualization if history is empty
  const chartData = history.length > 0 ? history : [
    { date: '1', weight_kg: 60.0 },
    { date: '3', weight_kg: 60.2 },
    { date: '5', weight_kg: 60.1 },
    { date: '7', weight_kg: 60.5 },
    { date: '9', weight_kg: 60.8 },
    { date: '11', weight_kg: 61.2 },
    { date: '14', weight_kg: 61.5 },
  ];

  const currentWeight = history.length > 0 ? history[history.length - 1].weight_kg : 61.5;
  const startWeight = history.length > 0 ? history[0].weight_kg : 60.0;
  const change = currentWeight - startWeight;

  if (loading) return <ProgressSkeleton />;

  return (
    <div className="pb-12 min-h-screen bg-background">
      <header className="px-6 pt-8 pb-4 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <button onClick={() => navigate('/home')} className="p-2 -ml-2 text-white/50">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Progress</h1>
        <div className="w-10" />
      </header>

      <main className="px-6 mt-6 space-y-6">
        {/* Weight Chart */}
        <section className="card bg-surface overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Weight Analysis (14D)</h3>
            <span className="text-primary text-xs font-bold uppercase">{change >= 0 ? '+' : ''}{change.toFixed(1)} kg total</span>
          </div>
          <div className="h-48 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#4CAF50', fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ display: 'none' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight_kg" 
                  stroke="#4CAF50" 
                  strokeWidth={3} 
                  dot={false}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="Start" value={`${startWeight}kg`} />
          <StatBox label="Current" value={`${currentWeight}kg`} />
          <StatBox label="Change" value={`${change >= 0 ? '+' : ''}${change.toFixed(1)}kg`} highlight color={change >= 0 ? 'text-primary' : 'text-red-500'} />
        </div>

        {/* Streak & Consistency */}
        <div className="space-y-4">
          <div className="card flex items-center gap-4">
            <div className="bg-orange-500/10 p-3 rounded-2xl text-orange-500">
              <Flame size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xl font-black leading-tight">7 Day Streak</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Consistency level: High</p>
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Weekly Performance</h3>
              <Calendar size={14} className="text-white/20" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm text-white/60">Average Calories</span>
                <span className="font-bold">2,840 kcal</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="w-[85%] h-full bg-primary" />
              </div>
              
              <div className="flex justify-between items-end pt-2">
                <span className="text-sm text-white/60">Workouts Completed</span>
                <span className="font-bold text-primary">5 / 7</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="w-[71%] h-full bg-primary" />
              </div>
            </div>
          </div>
        </div>

        <section className="card border-primary/20 bg-primary/5">
          <div className="flex gap-4 items-start">
            <TrendingUp className="text-primary mt-1" size={20} />
            <div>
              <p className="text-xs text-white/80 leading-relaxed font-medium">
                You are currently in a caloric surplus. Weight gain of 0.2kg/week detected. Maintain current intensity.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const StatBox = ({ label, value, highlight, color }: any) => (
  <div className="card px-2 py-4 text-center">
    <p className={`text-base font-black ${highlight ? color : 'text-white'}`}>{value}</p>
    <p className="text-[9px] text-white/30 uppercase tracking-widest mt-1 font-bold">{label}</p>
  </div>
);

const ProgressSkeleton = () => (
  <div className="px-6 pt-24 space-y-6 animate-pulse">
    <div className="h-64 w-full bg-white/5 rounded-3xl" />
    <div className="grid grid-cols-3 gap-3">
      <div className="h-20 bg-white/5 rounded-2xl" />
      <div className="h-20 bg-white/5 rounded-2xl" />
      <div className="h-20 bg-white/5 rounded-2xl" />
    </div>
    <div className="h-32 w-full bg-white/5 rounded-3xl" />
  </div>
);

export default ProgressPage;
