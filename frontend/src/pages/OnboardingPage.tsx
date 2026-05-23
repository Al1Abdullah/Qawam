import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, ChefHat, Clock, Target, User } from 'lucide-react';
import { apiService } from '../services/api';
import { storage } from '../services/storage';
import { useNavigate } from 'react-router-dom';

const STEPS = 5;

const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: 170,
    weight: 60,
    bodyType: '',
    goal: '',
    wakeTime: '08:00',
    sleepTime: '23:00',
    uniStart: '09:00',
    uniEnd: '17:00',
    noFixedSchedule: false,
    kitchenItems: {} as Record<string, boolean>,
  });

  const bmi = (formData.weight / Math.pow(formData.height / 100, 2)).toFixed(1);

  const nextStep = () => setStep((s) => Math.min(s + 1, STEPS));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleKitchenToggle = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      kitchenItems: {
        ...prev.kitchenItems,
        [item]: !prev.kitchenItems[item],
      },
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: formData.name,
        age: parseInt(formData.age),
        height_cm: formData.height,
        weight_kg: formData.weight,
        body_type: formData.bodyType,
        goal: formData.goal,
        activity_level: 'moderate',
      };

      console.log('Submitting payload:', payload);
      console.log('Sending registration payload:', payload);
      const res = await apiService.registerUser(payload);
      console.log('Registration response:', res);

      if (res.user_id) {
        const userId = res.user_id;
        
        console.log('Saving additional details for user:', userId);
        // Save additional details
        await Promise.all([
          apiService.saveSchedule(userId, {
            wake_time: formData.wakeTime,
            sleep_time: formData.sleepTime,
            university_start: formData.noFixedSchedule ? null : formData.uniStart,
            university_end: formData.noFixedSchedule ? null : formData.uniEnd,
          }),
          apiService.saveKitchen(userId, {
            items: formData.kitchenItems,
          })
        ]).then(() => {
          console.log('Additional details saved successfully');
        }).catch(err => {
          console.error('Error saving additional details:', err);
          throw err; // Re-throw to be caught by the outer catch
        });

        storage.saveUserId(userId);
        storage.saveUserName(formData.name);
        storage.setOnboardingDone(true);
        navigate('/home');
      }
    } catch (err: any) {
      console.error('Full registration error object:', err);
      setError(`Server error: ${err?.response?.data?.detail || err?.message || JSON.stringify(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const isNextDisabled = () => {
    if (step === 1) return !formData.name || !formData.age;
    if (step === 2) return !formData.bodyType;
    if (step === 3) return !formData.goal;
    return false;
  };

  return (
    <div className="px-6 pt-12 pb-24 min-h-screen flex flex-col">
      {/* Progress Bar */}
      <div className="flex gap-2 mb-12">
        {Array.from({ length: STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i + 1 <= step ? 'bg-primary' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1"
        >
          {step === 1 && (
            <div className="space-y-8">
              <header>
                <h1 className="text-5xl font-bold text-primary mb-2">Qawam</h1>
                <p className="text-xl font-medium">Built for you. Not for everyone.</p>
                <p className="text-white/50 mt-2">Tell us about yourself. This takes 2 minutes.</p>
              </header>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-white/50 mb-2">What do you go by?</label>
                  <input
                    type="text"
                    placeholder="e.g. Ali"
                    className="input-field w-full text-xl"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-2">Age</label>
                  <input
                    type="number"
                    placeholder="21"
                    className="input-field w-full text-xl"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm text-white/50">Height</label>
                    <span className="text-2xl font-bold text-primary">{formData.height}<small className="text-sm text-white/50 ml-1">cm</small></span>
                  </div>
                  <input
                    type="range"
                    min="140"
                    max="220"
                    className="w-full accent-primary h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm text-white/50">Weight</label>
                    <span className="text-2xl font-bold text-primary">{formData.weight}<small className="text-sm text-white/50 ml-1">kg</small></span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="150"
                    className="w-full accent-primary h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                  />
                  <p className="text-center text-xs text-white/30 italic">Estimated BMI: {bmi}</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold">Which one sounds like you?</h2>
              <div className="space-y-4">
                {[
                  { label: "I eat a lot but stay thin", value: 'ectomorph', icon: User },
                  { label: "I'm somewhere in the middle", value: 'mesomorph', icon: User },
                  { label: "I gain weight just by looking at food", value: 'endomorph', icon: User },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setFormData({ ...formData, bodyType: item.value })}
                    className={`card w-full text-left flex items-center gap-4 transition-all ${
                      formData.bodyType === item.value 
                        ? 'border-primary ring-1 ring-primary ring-opacity-50' 
                        : 'hover:border-white/20'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${formData.bodyType === item.value ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/50'}`}>
                      <item.icon size={24} />
                    </div>
                    <span className="text-lg font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold">What do you actually want?</h2>
              <div className="space-y-4">
                {[
                  { label: "Gain weight and get stronger", value: 'gain_weight', icon: Target },
                  { label: "Lose fat and look lean", value: 'lose_weight', icon: Target },
                  { label: "Just stay consistent and healthy", value: 'maintain', icon: Target },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setFormData({ ...formData, goal: item.value })}
                    className={`card w-full text-left flex items-center gap-4 transition-all ${
                      formData.goal === item.value 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-white/20'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${formData.goal === item.value ? 'bg-primary text-white' : 'bg-white/5 text-white/50'}`}>
                      <item.icon size={24} />
                    </div>
                    <span className="text-lg font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <header>
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-2"><Clock className="text-primary" /> Tell me your day</h2>
                <p className="text-white/50">So we don't suggest a heavy meal right before your 2pm class.</p>
              </header>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">Wake Up</label>
                    <input type="time" className="input-field w-full" value={formData.wakeTime} onChange={(e) => setFormData({...formData, wakeTime: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">Sleep</label>
                    <input type="time" className="input-field w-full" value={formData.sleepTime} onChange={(e) => setFormData({...formData, sleepTime: e.target.value})} />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-primary" 
                      checked={formData.noFixedSchedule} 
                      onChange={(e) => setFormData({...formData, noFixedSchedule: e.target.checked})} 
                    />
                    <span className="text-white/70 group-hover:text-white transition-colors">I don't have a fixed schedule</span>
                  </label>
                </div>

                {!formData.noFixedSchedule && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">Uni/Work Start</label>
                      <input type="time" className="input-field w-full" value={formData.uniStart} onChange={(e) => setFormData({...formData, uniStart: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">Uni/Work End</label>
                      <input type="time" className="input-field w-full" value={formData.uniEnd} onChange={(e) => setFormData({...formData, uniEnd: e.target.value})} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8 pb-10">
              <header>
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-2"><ChefHat className="text-primary" /> What's at home?</h2>
                <p className="text-white/50">We'll only suggest meals you can actually make with what you have.</p>
              </header>

              <div className="space-y-4">
                {[
                  { title: "Grains", items: ["Roti/Atta", "Rice", "Bread", "Paratha"] },
                  { title: "Protein", items: ["Eggs", "Chicken", "Lobia", "Daal", "Canned tuna", "Paneer/Cheese"] },
                  { title: "Vegetables", items: ["Aloo", "Pyaz", "Tamatar", "Saag", "Karela", "Mixed sabzi"] },
                  { title: "Dairy & Extras", items: ["Milk", "Dahi", "Butter/Ghee", "Peanut butter", "Banana", "Any fruit"] }
                ].map((cat) => (
                  <div key={cat.title} className="space-y-3">
                    <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest">{cat.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      {cat.items.map(item => (
                        <button
                          key={item}
                          onClick={() => handleKitchenToggle(item)}
                          className={`px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                            formData.kitchenItems[item] 
                              ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                              : 'border-white/10 text-white/50 hover:border-white/30'
                          }`}
                        >
                          {formData.kitchenItems[item] && <Check size={14} className="inline mr-1" />}
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent pt-12 max-w-md mx-auto">
        {error && <p className="text-red-500 text-center mb-4 text-sm font-medium">{error}</p>}
        <div className="flex gap-4">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <button
            onClick={step === STEPS ? handleSubmit : nextStep}
            disabled={isNextDisabled() || loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2 text-lg shadow-xl shadow-primary/20"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {step === STEPS ? "I'm ready, let's go" : "Continue"}
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default OnboardingPage;
