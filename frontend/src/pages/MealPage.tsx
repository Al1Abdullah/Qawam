import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { storage } from '../services/storage';

const MealPage = () => {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null);
  const [eatenMeals, setEatenMeals] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  const userId = storage.getUserId();

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await apiService.getTodayPlan(userId);
      setPlan(data?.meal_plan);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const regenerate = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await apiService.regeneratePlan(userId);
      setPlan(data?.meal_plan);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const logMeal = async (index: number, meal: any) => {
    if (!userId) return;
    try {
      await apiService.logMeal(userId, meal);
      setEatenMeals(prev => new Set([...prev, index]));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <MealSkeleton />;

  return (
    <div className="pb-10 min-h-screen bg-background">
      <header className="px-6 pt-8 pb-4 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <button onClick={() => navigate('/home')} className="p-2 -ml-2 text-white/50">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Today's Meals</h1>
        <div className="flex gap-2">
          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded uppercase">
            {plan?.total_calories} kcal
          </span>
          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded uppercase">
            {plan?.protein_est}g protein
          </span>
        </div>
      </header>

      <main className="px-6 mt-4 space-y-4">
        {plan?.meals?.map((meal: any, index: number) => {
          const isEaten = eatenMeals.has(index);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card transition-all ${isEaten ? 'border-primary/50' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="bg-primary text-white text-[10px] font-black px-2 py-1 rounded">
                  {meal.time}
                </span>
                <span className="text-xs font-bold text-primary">{meal.calories} kcal</span>
              </div>
              <h3 className="text-lg font-bold mb-3">{meal.name}</h3>
              <ul className="space-y-1 mb-4">
                {meal.items.map((item: string, i: number) => (
                  <li key={i} className="text-sm text-white/60 flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full" /> {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-white/40 italic leading-relaxed mb-6 border-l border-white/10 pl-3">
                {meal.instructions}
              </p>
              
              <button
                disabled={isEaten}
                onClick={() => logMeal(index, meal)}
                className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  isEaten 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-surface border border-primary/50 text-primary hover:bg-primary hover:text-white'
                }`}
              >
                {isEaten ? (
                  <>
                    <CheckCircle2 size={16} /> Eaten
                  </>
                ) : (
                  'Mark as eaten'
                )}
              </button>
            </motion.div>
          );
        })}

        <button
          onClick={regenerate}
          className="w-full py-8 text-white/30 hover:text-white/50 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
        >
          <RefreshCcw size={14} /> Regenerate plan
        </button>
      </main>
    </div>
  );
};

const MealSkeleton = () => (
  <div className="px-6 pt-24 space-y-6 animate-pulse">
    {[1, 2, 3].map(i => (
      <div key={i} className="h-48 w-full bg-white/5 rounded-3xl" />
    ))}
  </div>
);

export default MealPage;
