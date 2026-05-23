import { Routes, Route, Navigate } from 'react-router-dom';
import { storage } from './services/storage';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import MealPage from './pages/MealPage';
import WorkoutPage from './pages/WorkoutPage';
import ProgressPage from './pages/ProgressPage';

function App() {
  const isAuth = !!storage.getUserId();

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background relative">
      <Routes>
        <Route path="/" element={!isAuth ? <OnboardingPage /> : <Navigate to="/home" />} />
        <Route path="/home" element={isAuth ? <HomePage /> : <Navigate to="/" />} />

        <Route path="/meals" element={isAuth ? <MealPage /> : <Navigate to="/" />} />
        <Route path="/workout" element={isAuth ? <WorkoutPage /> : <Navigate to="/" />} />
        <Route path="/progress" element={isAuth ? <ProgressPage /> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
</div>
  );
}

export default App;
