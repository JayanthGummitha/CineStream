/**
 * Episode ID Resolution Utility
 *
 * This module provides utilities for resolving episode ID format mismatches
 * between different data sources (TMDB props vs metadata service).
 *
 * @module episode-id-resolver
 * @version 1.0.0
 */

import { Episode } from "@/types";
import { EpisodeMetadata } from "@/lib/episode-metadata";

/**
 * Episode ID format types
 */
export type EpisodeIdFormat = "tmdb" | "metadata" | "unknown";

/**
 * Parsed episode ID components
 */
export interface ParsedEpisodeId {
  format: EpisodeIdFormat;
  seriesId?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  originalId: string;
}

/**
 * Episode matching result
 */
export interface EpisodeMatchResult {
  found: boolean;
  episode?: Episode;
  index?: number;
  matchType: "exact" | "resolved" | "none";
}

/**
 * Parses an episode ID to extract its components and format
 *
 * @param episodeId - The episode ID to parse
 * @returns Parsed episode ID information
 */
export function parseEpisodeId(episodeId: string): ParsedEpisodeId {
  if (!episodeId || typeof episodeId !== "string") {
    return {
      format: "unknown",
      originalId: episodeId || "",
    };
  }

  // TMDB format: {seriesId}-s{seasonNumber}-e{episodeNumber}
  const tmdbMatch = episodeId.match(/^(.+)-s(\d+)-e(\d+)$/);
  if (tmdbMatch) {
    return {
      format: "tmdb",
      seriesId: tmdbMatch[1],
      seasonNumber: parseInt(tmdbMatch[2], 10),
      episodeNumber: parseInt(tmdbMatch[3], 10),
      originalId: episodeId,
    };
  }

  // Metadata service format: episode-{episodeNumber}
  const metadataMatch = episodeId.match(/^episode-(\d+)$/);
  if (metadataMatch) {
    return {
      format: "metadata",
      episodeNumber: parseInt(metadataMatch[1], 10),
      originalId: episodeId,
    };
  }

  return {
    format: "unknown",
    originalId: episodeId,
  };
}

/**
 * Generates possible episode ID variants for matching
 *
 * @param episodeId - The original episode ID
 * @param context - Additional context for ID generation
 * @returns Array of possible episode ID variants
 */
export function generateEpisodeIdVariants(
  episodeId: string,
  context?: {
    seriesId?: string;
    seasonNumber?: number;
    episodeList?: Episode[];
  }
): string[] {
  const variants: string[] = [episodeId]; // Always include original
  const parsed = parseEpisodeId(episodeId);

  if (parsed.format === "metadata" && parsed.episodeNumber && context) {
    // Convert metadata format to TMDB format variants
    if (context.seriesId && context.seasonNumber) {
      variants.push(
        `${context.seriesId}-s${context.seasonNumber}-e${parsed.episodeNumber}`
      );
    }

    // Try to infer series ID from episode list
    if (context.episodeList && context.episodeList.length > 0) {
      const firstEpisode = context.episodeList[0];
      const firstParsed = parseEpisodeId(firstEpisode.id);

      if (firstParsed.format === "tmdb" && firstParsed.seriesId) {
        const inferredSeasonNumber =
          context.seasonNumber || firstParsed.seasonNumber || 1;
        variants.push(
          `${firstParsed.seriesId}-s${inferredSeasonNumber}-e${parsed.episodeNumber}`
        );
      }
    }
  }

  if (parsed.format === "tmdb" && parsed.episodeNumber) {
    // Convert TMDB format to metadata format
    variants.push(`episode-${parsed.episodeNumber}`);
  }

  // Remove duplicates
  return [...new Set(variants)];
}

/**
 * Finds an episode in the episode list using ID resolution
 *
 * @param targetEpisodeId - The episode ID to find
 * @param episodeList - The list of episodes to search in
 * @param context - Additional context for ID resolution
 * @returns Episode match result
 */
export function findEpisodeWithIdResolution(
  targetEpisodeId: string,
  episodeList: Episode[],
  context?: {
    seriesId?: string;
    seasonNumber?: number;
  }
): EpisodeMatchResult {
  if (!targetEpisodeId || !episodeList || episodeList.length === 0) {
    return {
      found: false,
      matchType: "none",
    };
  }

  // Try exact match first
  const exactIndex = episodeList.findIndex((ep) => ep.id === targetEpisodeId);
  if (exactIndex !== -1) {
    return {
      found: true,
      episode: episodeList[exactIndex],
      index: exactIndex,
      matchType: "exact",
    };
  }

  // Try ID resolution variants
  const variants = generateEpisodeIdVariants(targetEpisodeId, {
    ...context,
    episodeList,
  });

  for (const variant of variants) {
    if (variant === targetEpisodeId) continue; // Skip original (already tried)

    const variantIndex = episodeList.findIndex((ep) => ep.id === variant);
    if (variantIndex !== -1) {
     

      return {
        found: true,
        episode: episodeList[variantIndex],
        index: variantIndex,
        matchType: "resolved",
      };
    }
  }

  // Try episode number matching as last resort
  const parsed = parseEpisodeId(targetEpisodeId);
  if (parsed.episodeNumber) {
    const episodeNumberIndex = episodeList.findIndex((ep) => {
      const epParsed = parseEpisodeId(ep.id);
      return epParsed.episodeNumber === parsed.episodeNumber;
    });

    if (episodeNumberIndex !== -1) {
      

      return {
        found: true,
        episode: episodeList[episodeNumberIndex],
        index: episodeNumberIndex,
        matchType: "resolved",
      };
    }
  }

  return {
    found: false,
    matchType: "none",
  };
}

/**
 * Normalizes episode metadata ID to match episode list format
 *
 * @param episodeMetadata - The episode metadata to normalize
 * @param episodeList - The episode list to match against
 * @param context - Additional context for normalization
 * @returns Normalized episode metadata
 */
export function normalizeEpisodeMetadataId(
  episodeMetadata: EpisodeMetadata,
  episodeList: Episode[],
  context?: {
    seriesId?: string;
    seasonNumber?: number;
  }
): EpisodeMetadata {
  const matchResult = findEpisodeWithIdResolution(
    episodeMetadata.id,
    episodeList,
    context
  );

  if (
    matchResult.found &&
    matchResult.episode &&
    matchResult.matchType === "resolved"
  ) {
    // Update the metadata ID to match the episode list format
    return {
      ...episodeMetadata,
      id: matchResult.episode.id,
    };
  }

  return episodeMetadata;
}

/**
 * Validates episode ID consistency across data sources
 *
 * @param episodeList - The episode list from props
 * @param metadataEpisodeId - The episode ID from metadata service
 * @param context - Additional context for validation
 * @returns Validation result with recommendations
 */
export function validateEpisodeIdConsistency(
  episodeList: Episode[],
  metadataEpisodeId: string,
  context?: {
    seriesId?: string;
    seasonNumber?: number;
  }
): {
  isConsistent: boolean;
  recommendedAction: "use_exact" | "use_resolved" | "use_fallback";
  resolvedEpisode?: Episode;
  details: string;
} {
  if (!episodeList || episodeList.length === 0) {
    return {
      isConsistent: false,
      recommendedAction: "use_fallback",
      details: "No episode list available for consistency check",
    };
  }

  const matchResult = findEpisodeWithIdResolution(
    metadataEpisodeId,
    episodeList,
    context
  );

  if (matchResult.found) {
    return {
      isConsistent: matchResult.matchType === "exact",
      recommendedAction:
        matchResult.matchType === "exact" ? "use_exact" : "use_resolved",
      resolvedEpisode: matchResult.episode,
      details:
        matchResult.matchType === "exact"
          ? "Episode ID matches exactly"
          : `Episode found using ID resolution (${matchResult.matchType})`,
    };
  }

  return {
    isConsistent: false,
    recommendedAction: "use_fallback",
    details: "Episode not found in episode list with any ID resolution method",
  };
}
