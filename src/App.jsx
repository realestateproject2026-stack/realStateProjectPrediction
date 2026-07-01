import { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SellerPage from './pages/SellerPage';
import BuyerPage from './pages/BuyerPage';
import PredictPricePage from './pages/PredictPricePage';
import LandPage from './pages/LandPage';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onNavigate={setActiveTab} />;
      case 'land':
        return <LandPage />;
      case 'seller':
        return <SellerPage />;
      case 'buyer':
        return <BuyerPage />;
      case 'predict':
        return <PredictPricePage />;
      default:
        return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1">{renderContent()}</main>
      <Footer />
    </div>
  );
}

export default App;
