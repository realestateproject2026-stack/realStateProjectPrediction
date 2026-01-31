import { useState } from 'react';
import Navbar from './components/Navbar';
import SellerPage from './pages/SellerPage';
import BuyerPage from './pages/BuyerPage';
import PredictPricePage from './pages/PredictPricePage';
import LandPage from './pages/LandPage';

function App() {
  const [activeTab, setActiveTab] = useState('predict');

  const renderContent = () => {
    switch (activeTab) {
      case 'land':
        return <LandPage />;
      case 'seller':
        return <SellerPage />;
      case 'buyer':
        return <BuyerPage />;
      case 'predict':
        return <PredictPricePage />;
      default:
        return <PredictPricePage />;
    }
  };

  return (
    <div className="min-h-screen bg-purple-50">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
