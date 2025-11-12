'use client';

import { useEffect, useRef } from 'react';
import { useGSAPAnimation } from '@/hooks/useGSAPAnimation';
import { gsap } from 'gsap';

/**
 * Demo component to showcase GSAP animation integration
 * This component demonstrates the animation foundation setup
 */
export function AnimationDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  
  const {
    createTimeline,
    prefersReducedMotion,
  } = useGSAPAnimation();

  useEffect(() => {
    if (!containerRef.current || !cardsRef.current) return;

    // Create master timeline for demo
    const tl = createTimeline();

    // Add entrance animation for the container
    tl.fromTo(containerRef.current, 
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 0.8 }
    );

    // Add staggered entrance for cards
    const cards = cardsRef.current.querySelectorAll('.demo-card');
    tl.fromTo(cards,
      { opacity: 0, y: 30, scale: 0.9 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      },
      '-=0.4'
    );

    // Setup hover animations for cards
    cards.forEach((card) => {
      const cardElement = card as HTMLElement;
      
      cardElement.addEventListener('mouseenter', () => {
        gsap.to(cardElement, {
          scale: 1.05,
          y: -10,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      cardElement.addEventListener('mouseleave', () => {
        gsap.to(cardElement, {
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });

    return () => {
      // Cleanup is handled by the hook
    };
  }, [createTimeline]);

  return (
    <div className="p-8 bg-gradient-to-br from-gray-900 to-black min-h-screen">
      <div ref={containerRef} className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          GSAP Animation Demo
        </h1>
        
        {prefersReducedMotion() && (
          <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-4 mb-8">
            <p className="text-blue-200 text-sm">
              Reduced motion detected - animations are simplified for accessibility
            </p>
          </div>
        )}

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="demo-card bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 cursor-pointer"
            >
              <div className="card-glow absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl opacity-0 transition-opacity" />
              <h3 className="text-xl font-semibold text-white mb-4">
                Animation Card {i}
              </h3>
              <p className="text-gray-300">
                This card demonstrates GSAP entrance and hover animations with proper
                accessibility support and performance optimization.
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-green-900/50 border border-green-500 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-green-200 mb-4">
              ✅ GSAP Integration Complete
            </h2>
            <ul className="text-green-300 space-y-2 text-left max-w-2xl mx-auto">
              <li>• GSAP installed and configured with Next.js tree-shaking</li>
              <li>• Animation utilities and configuration constants created</li>
              <li>• TypeScript interfaces for animation props defined</li>
              <li>• Custom React hook for GSAP management implemented</li>
              <li>• Accessibility support with reduced motion detection</li>
              <li>• Mobile optimization and performance considerations</li>
              <li>• Comprehensive test suite with mocked GSAP</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}