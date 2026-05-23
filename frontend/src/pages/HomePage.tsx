import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ChevronRight, CheckCircle2, Weight, Utensils, Activity, Home, ClipboardList, Dumbbell, BarChart2, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { storage } from '../services/storage';

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState('');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const navigate = useNavigate();
  const userName = storage.getUserName() || 'User';
  const userId = storage.getUserId();

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getTodayPlan(userId);
      setPlan(data);
    } catch (err) {
      setError('Failed to sync today\'s plan');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  if (loading) return <HomeSkeleton />;

  return (
    <div className="pb-28">
      {/* Header */}
      <header className="px-6 pt-8 pb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{getGreeting()}, {userName}</h1>
          <p className="text-white/50 text-sm mt-1">Here is your plan for today</p>
          <p className="text-white/30 text-xs mt-1 uppercase tracking-wider">{todayDate}</p>
        </div>
        <button className="p-2 bg-surface rounded-full border border-white/5 text-white/50">
          <Settings size={20} />
        </button>
      </header>

      <main className="px-6 space-y-6">
        {error ? (
          <div className="card border-red-500/50 bg-red-500/5 text-center py-8">
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <button onClick={fetchPlan} className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white">Retry Sync</button>
          </div>
        ) : (
          <>
            {/* Calorie Card */}
            <section className="card border-l-4 border-l-primary">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Daily Calorie Target</h3>
              <div className="flex justify-between items-end mb-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">1200</span>
                  <span className="text-white/40 text-sm">/ {plan?.meal_plan?.total_calories || 2800} kcal</span>
                </div>
                <span className="text-xs text-primary font-medium">{(plan?.meal_plan?.total_calories || 2800) - 1200} kcal remaining</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000" 
                  style={{ width: `${(1200 / (plan?.meal_plan?.total_calories || 2800)) * 100}%` }}
                />
              </div>
            </section>

            {/* Meal Preview */}
            <section className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Today's Meals</h3>
                <Link to="/meals" className="text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                  View Full Plan <ChevronRight size={14} />
                </Link>
              </div>
              <div className="space-y-4">
                {plan?.meal_plan?.meals?.slice(0, 2).map((meal: any, i: number) => (
                  <div key={i} className="flex gap-4 items-start">
                    <span className="text-xs font-bold text-white/30 w-12 pt-1 uppercase">{meal.time}</span>
                    <div>
                      <p className="font-medium text-sm">{meal.name}</p>
                      <p className="text-xs text-white/40 mt-1">{meal.items.join(', ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Workout Card */}
            <section className="card">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Today's Workout</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">{plan?.workout_plan?.workout_name || 'Upper Body Focus'}</p>
                  <p className="text-xs text-white/40 mt-1">{plan?.workout_plan?.duration_minutes || 25} minutes • No equipment</p>
                </div>
                {plan?.workout_done ? (
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 size={20} />
                    <span className="text-xs font-bold uppercase">Completed</span>
                  </div>
                ) : (
                  <button onClick={() => navigate('/workout')} className="p-3 bg-primary/10 text-primary rounded-xl">
                    <Activity size={20} />
                  </button>
                )}
              </div>
              {!plan?.workout_done && (
                <button 
                  onClick={() => navigate('/workout')}
                  className="w-full mt-6 btn-primary py-4 text-sm uppercase tracking-widest font-black"
                >
                  Start Workout
                </button>
              )}
            </section>

            {/* Quick Actions */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 ml-1">Quick Actions</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'weight', label: 'Log Weight', icon: Weight },
                  { id: 'kitchen', label: 'Kitchen', icon: Utensils },
                  { id: 'workout', label: 'Log Done', icon: CheckCircle2 },
                ].map((action) => (
                  <button
                    key={action.id}
                    onClick={() => setActiveModal(action.id)}
                    className="flex flex-col items-center gap-3 p-4 bg-surface rounded-2xl border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className="text-primary opacity-80">
                      <action.icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">{action.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-background/80 backdrop-blur-xl border-t border-white/5 px-8 py-6 flex justify-between items-center z-40">
        <NavIcon to="/home" icon={Home} active />
        <NavIcon to="/meals" icon={ClipboardList} />
        <NavIcon to="/workout" icon={Dumbbell} />
        <NavIcon to="/progress" icon={BarChart2} />
      </nav>

      {/* Modal Overlay */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-10 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-sm bg-surface rounded-3xl border border-white/10 p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-bold uppercase tracking-widest">
                  {activeModal === 'weight' && 'Log Weight'}
                  {activeModal === 'kitchen' && 'Update Kitchen'}
                  {activeModal === 'workout' && 'Quick Log Workout'}
                </h2>
                <button onClick={() => setActiveModal(null)} className="text-white/30 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {activeModal === 'weight' && (
                <div className="space-y-6">
                  <input type="number" placeholder="Enter current weight in kg" className="input-field w-full text-center text-2xl" autoFocus />
                  <button className="btn-primary w-full py-4 uppercase font-bold tracking-widest text-sm" onClick={() => setActiveModal(null)}>Confirm Entry</button>
                </div>
              )}

              {activeModal === 'kitchen' && (
                <div className="space-y-6">
                  <p className="text-sm text-white/50 text-center">Opening full kitchen inventory editor...</p>
                  <button className="btn-primary w-full py-4 uppercase font-bold tracking-widest text-sm" onClick={() => setActiveModal(null)}>Close</button>
                </div>
              )}

              {activeModal === 'workout' && (
                <div className="space-y-6 text-center">
                  <p className="text-sm text-white/50">Did you complete your workout today?</p>
                  <div className="flex gap-4">
                    <button className="flex-1 bg-white/5 py-4 rounded-xl uppercase font-bold tracking-widest text-xs" onClick={() => setActiveModal(null)}>No</button>
                    <button className="flex-1 btn-primary py-4 rounded-xl uppercase font-bold tracking-widest text-xs" onClick={() => setActiveModal(null)}>Yes, Completed</button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NavIcon = ({ to, icon: Icon, active = false }: any) => (
  <Link to={to} className={`transition-all ${active ? 'text-primary scale-110' : 'text-white/30 hover:text-white'}`}>
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
  </Link>
);

const HomeSkeleton = () => (
  <div className="px-6 pt-8 space-y-8 animate-pulse">
    <div className="space-y-3">
      <div className="h-8 w-48 bg-white/5 rounded-lg" />
      <div className="h-4 w-32 bg-white/5 rounded-lg" />
    </div>
    <div className="h-40 w-full bg-white/5 rounded-3xl" />
    <div className="h-32 w-full bg-white/5 rounded-3xl" />
    <div className="h-32 w-full bg-white/5 rounded-3xl" />
  </div>
);

export default HomePage;
