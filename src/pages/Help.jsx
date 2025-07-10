import React from 'react';

export default function Help() {
  return (
    <div className="min-h-screen bg-operon-background flex items-center justify-center pt-24 px-4">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-2xl w-full text-center">
        <h1 className="text-3xl font-semibold text-operon-charcoal mb-5">Need Help?</h1>
        <p className="text-operon-muted text-lg mb-8">
          Having trouble, need to report a problem, or want support?
        </p>
        <div className="mb-6">
          <p className="text-operon-charcoal text-lg font-medium mb-1">Call Us</p>
          <a href="tel:6513469559" className="text-operon-blue text-xl font-bold hover:underline">
            (651) 346-9559
          </a>
        </div>
        <div>
          <p className="text-operon-charcoal text-lg font-medium mb-1">Email</p>
          <a href="mailto:info@operonops.com" className="text-operon-blue text-lg font-medium hover:underline">
            info@operonops.com
          </a>
        </div>
      </div>
    </div>
  );
}
