import React from 'react';

export default function BackgroundOrbs({ className = '' }) {
  return (
    /* Fixed to the viewport so it never “ends” with a section */
    <div className={`pointer-events-none fixed inset-0 -z-10 ${className}`}>
      {/* Left / top blue orb */}
      <div
        className="absolute -left-[28vmin] -top-[24vmin] w-[110vmin] h-[110vmin] rounded-full blur-[70px] opacity-70"
        style={{
          background:
            'radial-gradient(closest-side, rgba(59,130,246,0.28), rgba(59,130,246,0) 70%)',
        }}
      />
      {/* Right / bottom cyan orb */}
      <div
        className="absolute -right-[32vmin] -bottom-[28vmin] w-[130vmin] h-[130vmin] rounded-full blur-[90px] opacity-70"
        style={{
          background:
            'radial-gradient(closest-side, rgba(34,211,238,0.24), rgba(34,211,238,0) 70%)',
        }}
      />
    </div>
  );
}
