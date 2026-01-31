import { useState, useEffect } from 'react';

function SellerPage() {
  const [view, setView] = useState('form'); // 'form' or 'dashboard'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sellerName: '',
    phoneNumber: '',
    email: '',
    landAddress: '',
    city: '',
    state: '',
    pincode: '',
    landAge: '',
    landArea: '',
    propertyType: 'Residential',
    price: '',
    description: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/seller/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          sellerName: '',
          phoneNumber: '',
          email: '',
          landAddress: '',
          city: '',
          state: '',
          pincode: '',
          landAge: '',
          landArea: '',
          propertyType: 'Residential',
          price: '',
          description: ''
        });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        alert('Error: ' + (data.message || 'Failed to submit'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewListings = async () => {
    if (!phoneNumber.trim()) {
      alert('Please enter your phone number');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/seller/my-listings/${phoneNumber}`);
      const data = await response.json();
      if (response.ok) {
        setListings(data.listings || []);
        setView('dashboard');
      } else {
        alert('Error: ' + (data.message || 'Failed to fetch listings'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error fetching listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-purple-900 mb-2">
                📋 My Listings
              </h1>
              <p className="text-purple-600">Phone: {phoneNumber}</p>
            </div>
            <button
              onClick={() => {
                setView('form');
                setPhoneNumber('');
                setListings([]);
              }}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all"
            >
              Add New Listing
            </button>
          </div>

          {listings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-2xl font-semibold text-purple-900 mb-2">No Listings Found</h2>
              <p className="text-purple-600">You haven't listed any properties yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div key={listing._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
                  {listing.images && listing.images.length > 0 ? (
                    <img 
                      src={`http://localhost:3000${listing.images[0]}`} 
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
                      <h3 className="text-xl font-bold text-purple-900">{listing.propertyType}</h3>
                      {listing.price && (
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                          ₹{listing.price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <p className="text-purple-600 mb-4">{listing.landAddress}, {listing.city}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      {listing.landArea && (
                        <div>
                          <span className="text-purple-500">Area:</span>
                          <span className="text-purple-900 font-semibold ml-2">{listing.landArea} sq ft</span>
                        </div>
                      )}
                      {listing.landAge !== undefined && (
                        <div>
                          <span className="text-purple-500">Age:</span>
                          <span className="text-purple-900 font-semibold ml-2">{listing.landAge} years</span>
                        </div>
                      )}
                    </div>
                    <div className="pt-4 border-t border-purple-200">
                      <p className="text-purple-500 text-sm">Seller: {listing.sellerName}</p>
                      <p className="text-purple-500 text-sm">Phone: {listing.phoneNumber}</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-purple-900 mb-2">View Your Listings</h2>
            <p className="text-purple-600">Enter your phone number to view your listed properties</p>
          </div>
          <div className="flex gap-4">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              className="flex-1 px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={handleViewListings}
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'View Listings'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-purple-900 mb-2">
              🏡 List Your Property
            </h1>
            <p className="text-purple-600">Fill in the details to list your property for sale</p>
          </div>

          {submitted && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              ✅ Property listed successfully! We'll contact you soon.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seller Information */}
            <div className="border-b border-purple-200 pb-6">
              <h2 className="text-2xl font-semibold text-purple-800 mb-4">Seller Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Seller Name *
                  </label>
                  <input
                    type="text"
                    name="sellerName"
                    value={formData.sellerName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Property Address */}
            <div className="border-b border-purple-200 pb-6">
              <h2 className="text-2xl font-semibold text-purple-800 mb-4">Property Address</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    name="landAddress"
                    value={formData.landAddress}
                    onChange={handleChange}
                    required
                    rows="3"
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Street address, building number"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="State"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="123456"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="border-b border-purple-200 pb-6">
              <h2 className="text-2xl font-semibold text-purple-800 mb-4">Property Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Property Type *
                  </label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Agricultural">Agricultural</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Land Age (years) *
                  </label>
                  <input
                    type="number"
                    name="landAge"
                    value={formData.landAge}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Land Area (sq ft) *
                  </label>
                  <input
                    type="number"
                    name="landArea"
                    value={formData.landArea}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Expected Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="5000000"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-purple-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe your property, nearby amenities, etc."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : '📝 List Property'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SellerPage;
