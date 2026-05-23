import { Routes, Route, Navigate } from 'react-router-dom';
import { storage } from './services/storage';
import OnboardingPage from './pages/OnboardingPage';

// Placeholder Components
const Home = () => <div className="p-10 text-center">Home</div>;
const Meals = () => <div className="p-10 text-center">Meals</div>;
const Workout = () => <div className="p-10 text-center">Workout</div>;
const Progress = () => <div className="p-10 text-center">Progress</div>;

function App() {
  const isAuth = !!storage.getUserId();

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background relative">
      <Routes>
        <Route path="/" element={!isAuth ? <OnboardingPage /> : <Navigate to="/home" />} />
        <Route path="/home" element={isAuth ? <HomePage /> : <Navigate to="/" />} />

        <Route path="/meals" element={isAuth ? <Meals /> : <Navigate to="/" />} />
        <Route path="/workout" element={isAuth ? <Workout /> : <Navigate to="/" />} />
        <Route path="/progress" element={isAuth ? <Progress /> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
</div>
  );
}

export default App;
