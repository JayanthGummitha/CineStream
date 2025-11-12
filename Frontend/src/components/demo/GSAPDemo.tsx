/**
 * Demo component to verify GSAP integration works in Next.js
 * This can be removed after verification
 */

'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ANIMATION_CONFIG, createPageEntranceTimeline } from '@/lib/animations';

export function GSAPDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Test basic GSAP functionality
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: ANIMATION_CONFIG.duration.entrance,
          ease: ANIMATION_CONFIG.easing.entrance 
        }
      );
    }

    // Test our custom timeline utility
    const timeline = createPageEntranceTimeline({
      header: headerRef,
      cards: cardsRef,
    });
    
    timeline.play();

    return () => {
      timeline.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="p-8 space-y-4">
      <div ref={headerRef} className="text-2xl font-bold">
        GSAP Integration Test
      </div>
      <div ref={cardsRef} className="grid grid-cols-3 gap-4">
        <div className="pricing-card p-4 bg-gray-100 rounded">Card 1</div>
        <div className="pricing-card p-4 bg-gray-100 rounded">Card 2</div>
        <div className="pricing-card p-4 bg-gray-100 rounded">Card 3</div>
      </div>
      <div className="text-sm text-gray-600">
        If you can see this with smooth animations, GSAP is working correctly!
      </div>
    </div>
  );
}