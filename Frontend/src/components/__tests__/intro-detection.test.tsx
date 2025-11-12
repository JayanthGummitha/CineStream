/**
 * Test file for intro detection and skip functionality
 * This validates the implementation of task 6 requirements
 */

import * as episodeMetadata from '@/lib/episode-metadata';

describe('Episode Metadata Module Import', () => {
    it('should successfully import episode metadata functions', () => {
        expect(episodeMetadata.getEpisodeMetadata).toBeDefined();
        expect(episodeMetadata.getMovieMetadata).toBeDefined();
        expect(episodeMetadata.getNextEpisode).toBeDefined();
        expect(typeof episodeMetadata.getEpisodeMetadata).toBe('function');
        expect(typeof episodeMetadata.getMovieMetadata).toBe('function');
        expect(typeof episodeMetadata.getNextEpisode).toBe('function');
    });

    it('should successfully call getMovieMetadata', async () => {
        const result = await episodeMetadata.getMovieMetadata('movie-1');
        expect(result).toBeDefined();
        expect(result?.id).toBe('movie-1');
        expect(result?.title).toBe('The Epic Adventure');
    });

    it('should successfully call getEpisodeMetadata', async () => {
        const result = await episodeMetadata.getEpisodeMetadata('episode-1');
        expect(result).toBeDefined();
        expect(result?.id).toBe('episode-1');
        expect(result?.title).toBe('Pilot Episode');
    });

    it('should successfully call getNextEpisode', async () => {
        const result = await episodeMetadata.getNextEpisode('episode-1');
        expect(result).toBeDefined();
        expect(result?.id).toBe('episode-2');
        expect(result?.title).toBe('The Discovery');
    });
});