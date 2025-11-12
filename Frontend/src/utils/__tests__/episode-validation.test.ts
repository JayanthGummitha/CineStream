/**
 * Episode Validation Utilities Tests
 */

import {
  validateEpisodeData,
  mapEpisodeToMetadata,
  validateEpisodeIndex,
  getNextEpisodeIndex,
  validateSeasonNumber,
  validateEpisodeNavigationProps,
  DEFAULT_EPISODE_MAPPING_CONFIG,
} from "../episode-validation";
import { type Episode } from "@/types";

// Mock episode data for testing
const mockEpisodes: Episode[] = [
  {
    id: "episode-1",
    title: "Pilot",
    description: "The first episode",
    episodeNumber: 1,
    duration: 2700,
    thumbnail: "/thumbnails/episode-1.jpg",
    releaseDate: "2024-01-01",
    rating: 8.5,
    src: "https://files.vidstack.io/sprite-fight/1080p.mp4", // Custom video source for episode 1
  },
  {
    id: "episode-2",
    title: "The Discovery",
    description: "Second episode",
    episodeNumber: 2,
    duration: 2640,
    thumbnail: "/thumbnails/episode-2.jpg",
    releaseDate: "2024-01-08",
    rating: 8.7,
    src: "https://files.vidstack.io/sprite-fight/720p.mp4", // Custom video source for episode 2
  },
  {
    id: "episode-3",
    title: "Revelations",
    description: "Third episode",
    episodeNumber: 3,
    duration: 2580,
    thumbnail: "/thumbnails/episode-3.jpg",
    releaseDate: "2024-01-15",
    rating: 9.0,
    // No src property - should fallback to default DASH source
  },
];

describe("Episode Validation Utilities", () => {
  describe("validateEpisodeData", () => {
    it("should validate correct episode data", () => {
      const result = validateEpisodeData(mockEpisodes, 0);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject non-array episodes", () => {
      const result = validateEpisodeData(null as any, 0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Episodes must be an array");
    });

    it("should reject empty episodes array", () => {
      const result = validateEpisodeData([], 0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Episodes array cannot be empty");
    });

    it("should reject invalid current index", () => {
      const result = validateEpisodeData(mockEpisodes, -1);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Invalid current episode index");
    });

    it("should reject current index out of bounds", () => {
      const result = validateEpisodeData(mockEpisodes, 10);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Invalid current episode index");
    });

    it("should reject episode with missing ID", () => {
      const invalidEpisodes = [{ ...mockEpisodes[0], id: "" }];
      const result = validateEpisodeData(invalidEpisodes, 0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Episode ID is required and must be a string");
    });

    it("should reject episode with missing title", () => {
      const invalidEpisodes = [{ ...mockEpisodes[0], title: "" }];
      const result = validateEpisodeData(invalidEpisodes, 0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Episode title is required and must be a string"
      );
    });

    it("should reject episode with invalid episode number", () => {
      const invalidEpisodes = [{ ...mockEpisodes[0], episodeNumber: 0 }];
      const result = validateEpisodeData(invalidEpisodes, 0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Episode number is required and must be a positive number"
      );
    });

    it("should reject episode with invalid duration", () => {
      const invalidEpisodes = [{ ...mockEpisodes[0], duration: -100 }];
      const result = validateEpisodeData(invalidEpisodes, 0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Episode duration is required and must be a positive number"
      );
    });
  });

  describe("mapEpisodeToMetadata", () => {
    it("should map episode to metadata correctly", () => {
      const episode = mockEpisodes[0];
      const result = mapEpisodeToMetadata(episode, 1, "series-1");

      expect(result).toEqual({
        id: episode.id,
        title: episode.title,
        description: episode.description,
        thumbnail: episode.thumbnail,
        src: episode.src, // Now uses episode's src property instead of default
        introStart: DEFAULT_EPISODE_MAPPING_CONFIG.defaultIntroStart,
        introEnd: DEFAULT_EPISODE_MAPPING_CONFIG.defaultIntroEnd,
        duration: episode.duration,
        seriesId: "series-1",
        seasonNumber: 1,
        episodeNumber: episode.episodeNumber,
      });
    });

    it("should use custom config when provided and episode has no src", () => {
      // Create episode without src property to test fallback
      const episodeWithoutSrc = {
        ...mockEpisodes[0],
        src: undefined,
      };
      const customConfig = {
        defaultVideoSource: "custom-source.mp4",
        defaultIntroStart: 10,
        defaultIntroEnd: 60,
      };

      const result = mapEpisodeToMetadata(
        episodeWithoutSrc,
        1,
        "series-1",
        customConfig
      );

      expect(result.src).toBe("custom-source.mp4"); // Should use custom config when episode has no src
      expect(result.introStart).toBe(10);
      expect(result.introEnd).toBe(60);
    });

    it("should prioritize episode src over custom config", () => {
      const episode = mockEpisodes[0]; // This has src property
      const customConfig = {
        defaultVideoSource: "custom-source.mp4",
        defaultIntroStart: 10,
        defaultIntroEnd: 60,
      };

      const result = mapEpisodeToMetadata(episode, 1, "series-1", customConfig);

      expect(result.src).toBe(episode.src); // Should use episode's src, not custom config
      expect(result.introStart).toBe(10); // But still use custom config for other properties
      expect(result.introEnd).toBe(60);
    });

    it("should handle missing description and thumbnail", () => {
      const episodeWithoutOptional = {
        ...mockEpisodes[0],
        description: undefined as any,
        thumbnail: undefined as any,
      };

      const result = mapEpisodeToMetadata(
        episodeWithoutOptional,
        1,
        "series-1"
      );

      expect(result.description).toBe("");
      expect(result.thumbnail).toBe("");
    });
  });

  describe("validateEpisodeIndex", () => {
    it("should return valid index", () => {
      expect(validateEpisodeIndex(1, 3)).toBe(1);
    });

    it("should return null for negative index", () => {
      expect(validateEpisodeIndex(-1, 3)).toBeNull();
    });

    it("should return null for index out of bounds", () => {
      expect(validateEpisodeIndex(5, 3)).toBeNull();
    });

    it("should return null for non-number index", () => {
      expect(validateEpisodeIndex("1" as any, 3)).toBeNull();
    });
  });

  describe("getNextEpisodeIndex", () => {
    it("should return next episode index", () => {
      expect(getNextEpisodeIndex(0, 3)).toBe(1);
      expect(getNextEpisodeIndex(1, 3)).toBe(2);
    });

    it("should return null for last episode", () => {
      expect(getNextEpisodeIndex(2, 3)).toBeNull();
    });

    it("should return null for invalid current index", () => {
      expect(getNextEpisodeIndex(5, 3)).toBeNull();
    });
  });

  describe("validateSeasonNumber", () => {
    it("should validate positive season numbers", () => {
      expect(validateSeasonNumber(1)).toBe(true);
      expect(validateSeasonNumber(5)).toBe(true);
    });

    it("should reject zero or negative season numbers", () => {
      expect(validateSeasonNumber(0)).toBe(false);
      expect(validateSeasonNumber(-1)).toBe(false);
    });

    it("should reject non-number season numbers", () => {
      expect(validateSeasonNumber("1" as any)).toBe(false);
      expect(validateSeasonNumber(null as any)).toBe(false);
    });
  });

  describe("validateEpisodeNavigationProps", () => {
    it("should return valid result when no episode data provided", () => {
      const result = validateEpisodeNavigationProps();
      expect(result.isValid).toBe(true);
      expect(result.hasEpisodeData).toBe(false);
      expect(result.canNavigate).toBe(false);
    });

    it("should return valid result when partial episode data provided", () => {
      const result = validateEpisodeNavigationProps(mockEpisodes);
      expect(result.isValid).toBe(true);
      expect(result.hasEpisodeData).toBe(false);
      expect(result.canNavigate).toBe(false);
    });

    it("should validate complete episode navigation props", () => {
      const result = validateEpisodeNavigationProps(mockEpisodes, 0, 1);
      expect(result.isValid).toBe(true);
      expect(result.hasEpisodeData).toBe(true);
      expect(result.canNavigate).toBe(true);
    });

    it("should reject invalid season number", () => {
      const result = validateEpisodeNavigationProps(mockEpisodes, 0, 0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Invalid season number: must be a positive number"
      );
      expect(result.hasEpisodeData).toBe(true);
      expect(result.canNavigate).toBe(false);
    });

    it("should reject invalid episode data", () => {
      const result = validateEpisodeNavigationProps(mockEpisodes, 10, 1);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Invalid current episode index");
      expect(result.hasEpisodeData).toBe(true);
      expect(result.canNavigate).toBe(false);
    });
  });
});
