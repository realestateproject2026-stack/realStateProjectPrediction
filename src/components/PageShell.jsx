function PageShell({ title, subtitle, children, className = '' }) {
  return (
    <div className={`min-h-screen bg-slate-50 ${className}`}>
      {(title || subtitle) && (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {title && (
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-2 text-slate-600 text-lg max-w-2xl">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">{children}</div>
    </div>
  );
}

export default PageShell;
