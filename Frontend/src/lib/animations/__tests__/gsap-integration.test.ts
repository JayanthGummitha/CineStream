/**
 * Tests for animation configuration and setup
 */

import {
  ANIMATION_CONFIG,
  TIMING_PRESETS,
  REDUCED_MOTION_CONFIG,
} from "../config";

describe('Animation Configuration', () => {
  describe('ANIMATION_CONFIG', () => {
    it('should have valid animation config structure', () => {
      expect(ANIMATION_CONFIG).toBeDefined();
      expect(ANIMATION_CONFIG.duration).toBeDefined();
      expect(ANIMATION_CONFIG.easing).toBeDefined();
      expect(ANIMATION_CONFIG.stagger).toBeDefined();
      expect(ANIMATION_CONFIG.transform).toBeDefined();
      expect(ANIMATION_CONFIG.effects).toBeDefined();
    });

    it('should have reasonable duration values', () => {
      Object.values(ANIMATION_CONFIG.duration).forEach(duration => {
        expect(typeof duration).toBe('number');
        expect(duration).toBeGreaterThan(0);
        expect(duration).toBeLessThan(5); // No animation should be longer than 5 seconds
      });
    });

    it('should have valid easing functions', () => {
      Object.values(ANIMATION_CONFIG.easing).forEach(easing => {
        expect(typeof easing).toBe('string');
        expect(easing.length).toBeGreaterThan(0);
      });
    });

    it('should have reasonable stagger values', () => {
      Object.values(ANIMATION_CONFIG.stagger).forEach(stagger => {
        expect(typeof stagger).toBe('number');
        expect(stagger).toBeGreaterThanOrEqual(0);
        expect(stagger).toBeLessThan(1); // Stagger should be less than 1 second
      });
    });
  });

  describe('TIMING_PRESETS', () => {
    it('should have valid timing presets', () => {
      expect(TIMING_PRESETS).toBeDefined();
      expect(TIMING_PRESETS.micro).toBeDefined();
      expect(TIMING_PRESETS.standard).toBeDefined();
      expect(TIMING_PRESETS.entrance).toBeDefined();
      expect(TIMING_PRESETS.bouncy).toBeDefined();
      expect(TIMING_PRESETS.page).toBeDefined();
    });

    it('should have valid preset structure', () => {
      Object.values(TIMING_PRESETS).forEach(preset => {
        expect(preset).toHaveProperty('duration');
        expect(preset).toHaveProperty('ease');
        expect(typeof preset.duration).toBe('number');
        expect(typeof preset.ease).toBe('string');
      });
    });
  });

  describe('REDUCED_MOTION_CONFIG', () => {
    it('should have reduced motion config', () => {
      expect(REDUCED_MOTION_CONFIG).toBeDefined();
      expect(REDUCED_MOTION_CONFIG.duration).toBeDefined();
      expect(REDUCED_MOTION_CONFIG.easing).toBeDefined();
      expect(REDUCED_MOTION_CONFIG.stagger).toBeDefined();
    });

    it('should have minimal durations for reduced motion', () => {
      Object.values(REDUCED_MOTION_CONFIG.duration).forEach(duration => {
        expect(typeof duration).toBe('number');
        expect(duration).toBeLessThanOrEqual(0.01); // Very short durations for reduced motion
      });
    });
  });
});