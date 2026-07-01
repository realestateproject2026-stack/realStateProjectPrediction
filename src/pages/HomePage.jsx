import { IMAGES, FEATURED_LISTINGS } from '../constants/images';

function HomePage({ onNavigate }) {
  const stats = [
    { value: '94%', label: 'Model accuracy (R²)' },
    { value: '6+', label: 'Chennai geo zones' },
    { value: '<2s', label: 'Prediction time' },
    { value: '3', label: 'Data modalities' },
  ];

  const features = [
    {
      title: 'Geospatial Embeddings',
      description:
        'Latitude and longitude are converted into sin/cos embeddings and distance-to-center features for spatially aware pricing.',
      image: IMAGES.mapGeo,
    },
    {
      title: 'Multimodal ML Pipeline',
      description:
        'Tabular property data fused with geographic signals — ready to extend with image and text modalities in Phase 2.',
      image: IMAGES.analytics,
    },
    {
      title: 'Interactive Map Picker',
      description:
        'Pin your property on OpenStreetMap and get instant AI-powered price estimates for any location.',
      image: IMAGES.cityAerial,
    },
  ];

  const steps = [
    { step: '01', title: 'Select location', text: 'Pick an area or drop a pin on the interactive map.' },
    { step: '02', title: 'Enter details', text: 'Add sq ft, age, furnishing, bedrooms and amenities.' },
    { step: '03', title: 'AI predicts', text: 'Our model computes geospatial embeddings and forecasts price.' },
    { step: '04', title: 'List or buy', text: 'Publish your property or browse listings on the marketplace.' },
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <img
          src={IMAGES.hero}
          alt="Modern luxury home"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-slate-900/40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-medium border border-emerald-500/30 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Multimodal ML · Geospatial AI
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Smarter house price predictions, powered by location intelligence
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-xl">
              GeoPrice AI combines property data with geospatial embeddings to deliver accurate,
              explainable price estimates — built for buyers, sellers, and researchers.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => onNavigate('predict')}
                className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
              >
                Predict Price Now
              </button>
              <button
                type="button"
                onClick={() => onNavigate('buyer')}
                className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/25 backdrop-blur-sm transition-all"
              >
                Browse Listings
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-950 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-emerald-400">{stat.value}</div>
                <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Why GeoPrice AI?
            </h2>
            <p className="mt-4 text-slate-600 text-lg">
              A research-grade pipeline that treats location as a first-class signal — not just a dropdown label.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                How it works
              </h2>
              <p className="mt-4 text-slate-600 text-lg">
                From map pin to price estimate in four simple steps.
              </p>
              <div className="mt-10 space-y-6">
                {steps.map((item) => (
                  <div key={item.step} className="flex gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-sm border border-emerald-100">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{item.title}</h4>
                      <p className="text-slate-600 text-sm mt-1">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onNavigate('predict')}
                className="mt-10 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors"
              >
                Try the predictor →
              </button>
            </div>
            <div className="relative">
              <img
                src={IMAGES.interior}
                alt="Modern property interior"
                className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-5 border border-slate-100 max-w-xs hidden sm:block">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Sample prediction</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">₹1.95 Cr</p>
                <p className="text-sm text-emerald-600 mt-1">Anna Nagar · 1,500 sq ft</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Featured properties</h2>
              <p className="mt-2 text-slate-600">Explore premium listings across top Chennai neighbourhoods.</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('buyer')}
              className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
            >
              View all listings →
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURED_LISTINGS.map((listing) => (
              <article
                key={listing.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-shadow group cursor-pointer"
                onClick={() => onNavigate('buyer')}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/95 text-xs font-semibold text-slate-800 shadow">
                    {listing.tag}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-slate-900">{listing.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{listing.area}</p>
                  <p className="text-xl font-bold text-emerald-600 mt-3">{listing.price}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <img
          src={IMAGES.skyline}
          alt="City skyline"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/85" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Ready to list or find your next home?
          </h2>
          <p className="mt-4 text-slate-300 text-lg">
            Join buyers and sellers using AI-powered geospatial pricing on GeoPrice AI.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('land')}
              className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-colors"
            >
              List your property
            </button>
            <button
              type="button"
              onClick={() => onNavigate('seller')}
              className="px-8 py-3.5 rounded-xl border border-white/30 text-white hover:bg-white/10 font-semibold transition-colors"
            >
              Seller dashboard
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
