'use client';

import React, { memo } from 'react';

const SimpleBg = memo(() => {
  return (
    <>
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Animated gradient background */}
        <div 
          className="absolute inset-0 opacity-50 animate-gradient-shift"
          style={{
            background: 'linear-gradient(45deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
            backgroundSize: '400% 400%',
          }}
        />
        
        {/* Floating circles - using Tailwind animations */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-float-slow" />
      </div>
      
      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(20px) translateX(-10px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          50% { transform: translateY(-15px) translateX(15px) scale(1.1); }
        }
        
        .animate-gradient-shift { animation: gradient-shift 15s ease infinite; }
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 10s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 12s ease-in-out infinite; }
      `}</style>
    </>
  );
});

SimpleBg.displayName = 'SimpleBg';

export default SimpleBg;
