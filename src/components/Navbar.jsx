import { useState } from 'react';

function Navbar({ activeTab, setActiveTab }) {
  return (
    <nav className="bg-purple-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-purple-600 p-2 rounded-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">NoBrokerLands</span>
          </div>

          {/* Navigation Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('land')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'land'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-purple-800 text-purple-200 hover:bg-purple-700'
              }`}
            >
              Land
            </button>
            <button
              onClick={() => setActiveTab('seller')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'seller'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-purple-800 text-purple-200 hover:bg-purple-700'
              }`}
            >
              Seller
            </button>
            <button
              onClick={() => setActiveTab('buyer')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'buyer'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-purple-800 text-purple-200 hover:bg-purple-700'
              }`}
            >
              Buyer
            </button>
            <button
              onClick={() => setActiveTab('predict')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'predict'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-purple-800 text-purple-200 hover:bg-purple-700'
              }`}
            >
              Predict Price
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

