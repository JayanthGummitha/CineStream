/**
 * Tests for GSAP animation utilities
 */

// Mock GSAP before importing anything else
jest.mock('gsap', () => ({
  gsap: {
    timeline: jest.fn(() => ({
      fromTo: jest.fn(),
      to: jest.fn(),
      set: jest.fn(),
      kill: jest.fn(),
    })),
    to: jest.fn(),
    fromTo: jest.fn(),
    set: jest.fn(),
    killTweensOf: jest.fn(),
    defaults: jest.fn(),
    registerPlugin: jest.fn(),
  },
}));

jest.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: jest.fn(() => ({
      kill: jest.fn(),
    })),
    getAll: jest.fn(() => []),
    refresh: jest.fn(),
    defaults: jest.fn(),
  },
}));

import { AnimationUtils } from '../utils';
import { ANIMATION_CONFIG } from '../config';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('AnimationUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('prefersReducedMotion', () => {
    it('should return false when reduced motion is not preferred', () => {
      expect(AnimationUtils.prefersReducedMotion()).toBe(false);
    });
  });

  describe('isMobileDevice', () => {
    it('should detect mobile device based on window width', () => {
      // Mock window.innerWidth
      const originalInnerWidth = window.innerWidth;
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      
      expect(AnimationUtils.isMobileDevice()).toBe(true);
      
      // Restore original value
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalInnerWidth,
      });
    });
  });

  describe('getOptimizedConfig', () => {
    it('should return base config when no optimizations needed', () => {
      const baseConfig = { duration: 0.5, ease: 'power2.out' };
      const result = AnimationUtils.getOptimizedConfig(baseConfig);
      
      expect(result).toEqual(baseConfig);
    });

    it('should return reduced motion config when preferred', () => {
      // Mock reduced motion preference
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = jest.fn().mockImplementation(() => ({
        matches: true,
        media: '',
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
      
      // Reset cache to pick up new matchMedia mock
      AnimationUtils.resetCache();
      
      const baseConfig = { duration: 0.5, ease: 'power2.out' };
      const result = AnimationUtils.getOptimizedConfig(baseConfig);
      
      expect(result.duration).toBe(0.1);
      expect(result.ease).toBe('none');
      
      // Restore original matchMedia and reset cache
      window.matchMedia = originalMatchMedia;
      AnimationUtils.resetCache();
    });
  });

  describe('createEntranceAnimation', () => {
    it('should create entrance animation with default config', () => {
      const mockTimeline = {
        fromTo: jest.fn(),
      };
      
      const { gsap } = require('gsap');
      (gsap.timeline as jest.Mock).mockReturnValue(mockTimeline);
      
      const result = AnimationUtils.createEntranceAnimation('.test-element');
      
      expect(gsap.timeline).toHaveBeenCalled();
      expect(mockTimeline.fromTo).toHaveBeenCalledWith(
        '.test-element',
        expect.objectContaining({
          opacity: 0,
          y: 30,
          scale: 0.95,
        }),
        expect.objectContaining({
          opacity: 1,
          y: 0,
          scale: 1,
          duration: ANIMATION_CONFIG.duration.entrance,
          ease: ANIMATION_CONFIG.easing.entrance,
          stagger: ANIMATION_CONFIG.stagger.cards,
        })
      );
    });
  });

  describe('cleanup', () => {
    it('should kill all tweens and scroll triggers', () => {
      const { gsap } = require('gsap');
      const { ScrollTrigger } = require('gsap/ScrollTrigger');
      const mockTrigger = { kill: jest.fn() };
      
      (ScrollTrigger.getAll as jest.Mock).mockReturnValue([mockTrigger]);
      
      AnimationUtils.cleanup();
      
      expect(gsap.killTweensOf).toHaveBeenCalledWith('*');
      expect(mockTrigger.kill).toHaveBeenCalled();
    });
  });
});