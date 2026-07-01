function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-semibold text-lg mb-3">GeoPrice AI</h3>
            <p className="text-sm leading-relaxed">
              Multimodal machine learning for house price prediction with geospatial embeddings.
              Built for accurate, data-driven real estate decisions.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>AI Price Prediction</li>
              <li>Property Listings</li>
              <li>Buyer & Seller Portal</li>
              <li>Geospatial Analytics</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Credits</h4>
            <p className="text-sm leading-relaxed">
              Property photos from{' '}
              <a
                href="https://unsplash.com"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300"
              >
                Unsplash
              </a>
              . Map data © OpenStreetMap contributors.
            </p>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-slate-800 text-sm text-center">
          © {new Date().getFullYear()} GeoPrice AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
