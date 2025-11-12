/**
 * Converts a title to a URL-friendly slug
 * @param title - The movie/TV show title
 * @returns URL-friendly slug
 */
export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Creates a full URL path with ID and title slug
 * @param basePath - The base path (e.g., 'movie', 'tv', 'documentaries', 'kids')
 * @param id - The movie/TV show ID
 * @param title - The movie/TV show title
 * @returns Full URL path
 */
export function createDetailUrl(basePath: string, id: string, title: string): string {
  const slug = createSlug(title);
  return `/${basePath}/${id}/${slug}`;
}