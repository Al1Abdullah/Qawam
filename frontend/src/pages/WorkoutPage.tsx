import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, CheckCircle2, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { storage } from '../services/storage';

const WorkoutPage = () => {
  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const navigate = useNavigate();
  const userId = storage.getUserId();

  useEffect(() => {
    fetchWorkout();
  }, []);

  const fetchWorkout = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await apiService.getTodayPlan(userId);
      setWorkout(data?.workout_plan);
      if (data?.workout_done) setIsCompleted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async () => {
    if (!userId || isCompleted) return;
    try {
      await apiService.logWorkout(userId, true);
      setIsCompleted(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <WorkoutSkeleton />;

  return (
    <div className="pb-12 min-h-screen bg-background">
      <header className="px-6 pt-8 pb-4 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <button onClick={() => navigate('/home')} className="p-2 -ml-2 text-white/50">
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold">Training Session</h1>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Focus: {workout?.workout_name}</p>
        </div>
        <div className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded">
          {workout?.duration_minutes} MIN
        </div>
      </header>

      <main className="px-6 mt-6 space-y-4">
        {workout?.exercises?.map((ex: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg">{ex.name}</h3>
              <div className="text-right">
                <p className="text-primary font-black text-xl leading-none">{ex.sets} × {ex.reps}</p>
                <p className="text-[10px] text-white/30 uppercase mt-1">Sets & Reps</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-center py-3 border-t border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/40 uppercase font-bold">Rest</span>
                <span className="text-xs font-bold">{ex.rest_seconds}s</span>
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-lg flex gap-3 items-start">
              <Info size={14} className="text-primary shrink-0 mt-0.5" />
              <p className="text-[11px] text-white/60 leading-relaxed italic">
                {ex.tip}
              </p>
            </div>
          </motion.div>
        ))}

        <section className="card bg-primary/5 border-primary/20 mt-8">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Cooldown</h4>
          <p className="text-sm text-white/70 leading-relaxed">{workout?.cooldown}</p>
        </section>

        <div className="pt-8 pb-4 space-y-4">
          <button
            onClick={markComplete}
            disabled={isCompleted}
            className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl ${
              isCompleted 
                ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                : 'bg-primary text-white shadow-primary/20 hover:scale-[0.98]'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 size={20} /> Completed
              </>
            ) : (
              'Mark as Complete'
            )}
          </button>
          
          <button
            onClick={() => navigate('/home')}
            className="w-full py-2 text-white/20 hover:text-white/40 text-[10px] font-bold uppercase tracking-widest"
          >
            Skip today
          </button>
        </div>
      </main>
    </div>
  );
};

const WorkoutSkeleton = () => (
  <div className="px-6 pt-24 space-y-4 animate-pulse">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="h-32 w-full bg-white/5 rounded-2xl" />
    ))}
  </div>
);

export default WorkoutPage;
