import { Routes, Route, Navigate } from 'react-router-dom';
import { storage } from './services/storage';

// Placeholder Components
const Onboarding = () => <div className="p-10 text-center">Onboarding (Root)</div>;
const Home = () => <div className="p-10 text-center">Home</div>;
const Meals = () => <div className="p-10 text-center">Meals</div>;
const Workout = () => <div className="p-10 text-center">Workout</div>;
const Progress = () => <div className="p-10 text-center">Progress</div>;

function App() {
  const isAuth = !!storage.getUserId();

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background relative">
      <Routes>
        <Route path="/" element={!isAuth ? <Onboarding /> : <Navigate to="/home" />} />
        <Route path="/home" element={isAuth ? <Home /> : <Navigate to="/" />} />
        <Route path="/meals" element={isAuth ? <Meals /> : <Navigate to="/" />} />
        <Route path="/workout" element={isAuth ? <Workout /> : <Navigate to="/" />} />
        <Route path="/progress" element={isAuth ? <Progress /> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
