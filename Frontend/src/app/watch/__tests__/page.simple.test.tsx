/**
 * Simple test to verify basic functionality
 */

import { render } from '@testing-library/react';

// Mock the Video component
jest.mock('@/components/Video', () => {
  return function MockVideo(props: any) {
    return <div data-testid="video-component" {...props} />;
  };
});

// Mock React's use hook
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  use: jest.fn()
}));

describe('Simple Watch Page Test', () => {
  it('should render without crashing', () => {
    const mockUse = require('react').use as jest.MockedFunction<typeof import('react').use>;
    
    mockUse.mockImplementation((promise) => {
      if (promise && typeof promise === 'object' && 'then' in promise) {
        return { id: 'test-id' };
      }
      return { id: 'test-id' };
    });

    // Import the component after mocking
    const WatchPage = require('../[id]/page').default;
    
    const mockParams = Promise.resolve({ id: 'test-movie-id' });
    const mockSearchParams = Promise.resolve({ fullscreen: 'true' });

    expect(() => {
      render(<WatchPage params={mockParams} searchParams={mockSearchParams} />);
    }).not.toThrow();
  });
});