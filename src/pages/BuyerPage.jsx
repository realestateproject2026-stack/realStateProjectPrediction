import { useState, useEffect } from 'react';

function BuyerPage() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [userData, setUserData] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('buyerUser');
    if (savedUser) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(savedUser));
      fetchProperties();
    }
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/seller/properties');
      const data = await response.json();
      if (response.ok) {
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/buyer/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobileNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowOtp(true);
        // In production, OTP would be sent via SMS
        alert(`OTP sent to ${mobileNumber}. For demo, use OTP: 123456`);
      } else {
        alert('Error: ' + (data.message || 'Failed to send OTP'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error connecting to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/buyer/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobileNumber, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsLoggedIn(true);
        setUserData(data.user);
        localStorage.setItem('buyerUser', JSON.stringify(data.user));
        fetchProperties();
        setShowOtp(false);
        setOtp('');
      } else {
        alert('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error verifying OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    localStorage.removeItem('buyerUser');
    setMobileNumber('');
    setShowOtp(false);
    setOtp('');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-purple-900 mb-2">
                Welcome, Buyer!
              </h1>
              <p className="text-purple-600">Login with your mobile number to browse properties</p>
            </div>

            {!showOtp ? (
              <form onSubmit={handleMobileSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                    placeholder="+91 9876543210"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {loading ? 'Sending OTP...' : '📱 Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpVerify} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Enter OTP *
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength="6"
                    className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg text-center tracking-widest"
                    placeholder="123456"
                  />
                  <p className="text-sm text-purple-600 mt-2">
                    OTP sent to {mobileNumber}
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtp(false);
                      setOtp('');
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-900 transition-all duration-200 shadow-lg disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : '✓ Verify'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-purple-900 mb-2">
              🏘️ Browse Properties
            </h1>
            <p className="text-purple-600">Welcome, {userData?.mobileNumber || 'Buyer'}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all"
          >
            Logout
          </button>
        </div>

        {selectedProperty ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <button
              onClick={() => setSelectedProperty(null)}
              className="mb-4 text-purple-600 hover:text-purple-800 font-semibold"
            >
              ← Back to Listings
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                {selectedProperty.images && selectedProperty.images.length > 0 ? (
                  <img 
                    src={`http://localhost:3000${selectedProperty.images[0]}`} 
                    alt="Property" 
                    className="w-full h-96 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="h-96 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-32 h-32 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                )}
                {selectedProperty.documents && selectedProperty.documents.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-purple-900 mb-2">Documents</h3>
                    <div className="space-y-2">
                      {selectedProperty.documents.map((doc, idx) => (
                        <a
                          key={idx}
                          href={`http://localhost:3000${doc}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all"
                        >
                          📄 Document {idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-purple-900 mb-4">{selectedProperty.propertyType}</h2>
                <div className="mb-6">
                  <p className="text-purple-600 text-lg mb-2">
                    📍 {selectedProperty.landAddress}, {selectedProperty.city}, {selectedProperty.state} - {selectedProperty.pincode}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-purple-500 text-sm">Price</p>
                    <p className="text-2xl font-bold text-purple-900">₹{selectedProperty.price?.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-purple-500 text-sm">Area</p>
                    <p className="text-2xl font-bold text-purple-900">{selectedProperty.landArea} sq ft</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-purple-500 text-sm">Age</p>
                    <p className="text-2xl font-bold text-purple-900">{selectedProperty.landAge} years</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-purple-500 text-sm">Type</p>
                    <p className="text-2xl font-bold text-purple-900">{selectedProperty.propertyType}</p>
                  </div>
                </div>
                {selectedProperty.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-purple-900 mb-2">Description</h3>
                    <p className="text-purple-700">{selectedProperty.description}</p>
                  </div>
                )}
                <div className="border-t border-purple-200 pt-6">
                  <h3 className="font-semibold text-purple-900 mb-4">Contact Information</h3>
                  <div className="space-y-2">
                    <p className="text-purple-700"><strong>Seller:</strong> {selectedProperty.sellerName}</p>
                    <p className="text-purple-700"><strong>Phone:</strong> {selectedProperty.phoneNumber}</p>
                    {selectedProperty.email && (
                      <p className="text-purple-700"><strong>Email:</strong> {selectedProperty.email}</p>
                    )}
                  </div>
                  <button className="mt-4 w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-900 transition-all">
                    📞 Contact Seller
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h2 className="text-2xl font-semibold text-purple-900 mb-2">No Properties Available</h2>
            <p className="text-purple-600">Check back later for new listings!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div 
                key={property._id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedProperty(property)}
              >
                {property.images && property.images.length > 0 ? (
                  <img 
                    src={`http://localhost:3000${property.images[0]}`} 
                    alt="Property" 
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                    <svg className="w-24 h-24 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-purple-900">{property.propertyType}</h3>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                      ₹{property.price?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-purple-600 mb-4">{property.landAddress}, {property.city}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-purple-500">Area:</span>
                      <span className="text-purple-900 font-semibold ml-2">{property.landArea} sq ft</span>
                    </div>
                    <div>
                      <span className="text-purple-500">Age:</span>
                      <span className="text-purple-900 font-semibold ml-2">{property.landAge} years</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <p className="text-purple-500 text-sm">Contact: {property.phoneNumber}</p>
                    <p className="text-purple-500 text-sm">Seller: {property.sellerName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BuyerPage;

