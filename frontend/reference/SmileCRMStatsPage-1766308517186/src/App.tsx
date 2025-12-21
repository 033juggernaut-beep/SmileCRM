/**
 * SmileCRM Stats Page Demo
 * Applies custom fonts matching SmileCRMBlueDashboard
 */

import { SmileCRMStatsPage } from './Component';

// Apply custom Tailwind config with fonts
if (typeof window !== 'undefined' && window.tailwind) {
  window.tailwind.config = {
    ...window.tailwind.config,
    theme: {
      extend: {
        fontFamily: {
          sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        },
      },
    },
  };
}

export default function App() {
  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link 
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" 
        rel="stylesheet" 
      />
      
      <div className="w-full min-h-screen font-sans">
        <SmileCRMStatsPage 
          initialTheme="light"
          onBack={() => console.log("Back button clicked")}
        />
      </div>
    </>
  );
}
