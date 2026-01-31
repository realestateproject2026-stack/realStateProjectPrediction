import { useState } from 'react';

function LandPage() {
  const [formData, setFormData] = useState({
    location: '',
    sq_ft: '',
    age: '',
    furnishing: '',
    amenities_count: '',
    bedrooms: '1',
    bathrooms: '1',
    propertyType: 'Residential',
    landAddress: '',
    city: '',
    state: '',
    pincode: '',
    description: ''
  });

  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    setDocuments(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Add images
      images.forEach((image, index) => {
        formDataToSend.append('images', image);
      });

      // Add documents
      documents.forEach((doc, index) => {
        formDataToSend.append('documents', doc);
      });

      const response = await fetch('http://localhost:3000/api/seller/register', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        // Reset form
        setFormData({
          location: '',
          sq_ft: '',
          age: '',
          furnishing: '',
          amenities_count: '',
          bedrooms: '1',
          bathrooms: '1',
          propertyType: 'Residential',
          landAddress: '',
          city: '',
          state: '',
          pincode: '',
          description: ''
        });
        setImages([]);
        setDocuments([]);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-purple-900 mb-2">
              🏞️ Add Land Details
            </h1>
            <p className="text-purple-600">Complete land information for listing</p>
          </div>

          {submitted && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              ✅ Land details added successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location & Basic Info */}
            <div className="border-b border-purple-200 pb-6">
              <h2 className="text-2xl font-semibold text-purple-800 mb-4">Location & Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Location (for prediction) *
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Location</option>
                    <option value="Downtown">Downtown</option>
                    <option value="Suburbs">Suburbs</option>
                    <option value="Beachfront">Beachfront</option>
                    <option value="City Center">City Center</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>

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
                    Square Footage (sq ft) *
                  </label>
                  <input
                    type="number"
                    name="sq_ft"
                    value={formData.sq_ft}
                    onChange={handleChange}
                    required
                    min="100"
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Property Age (years) *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Furnishing *
                  </label>
                  <select
                    name="furnishing"
                    value={formData.furnishing}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="Furnished">Furnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Amenities Count
                  </label>
                  <input
                    type="number"
                    name="amenities_count"
                    value={formData.amenities_count}
                    onChange={handleChange}
                    min="0"
                    max="20"
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="border-b border-purple-200 pb-6">
              <h2 className="text-2xl font-semibold text-purple-800 mb-4">Address</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Full Address *
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
                    <label className="block text-sm font-medium text-purple-700 mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-700 mb-2">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-700 mb-2">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* File Uploads */}
            <div className="border-b border-purple-200 pb-6">
              <h2 className="text-2xl font-semibold text-purple-800 mb-4">Images & Documents</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Property Images (Max 10)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {images.length > 0 && (
                    <p className="text-sm text-purple-600 mt-2">{images.length} image(s) selected</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Documents/PDFs (Max 5)
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handleDocumentChange}
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {documents.length > 0 && (
                    <p className="text-sm text-purple-600 mt-2">{documents.length} document(s) selected</p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe your land, nearby amenities, etc."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : '💾 Save Land Details'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LandPage;

