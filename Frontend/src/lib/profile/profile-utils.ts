/**
 * Profile Utility Functions
 * Provides helper functions for profile data formatting and manipulation
 */

/**
 * Formats a Date object into a readable string format
 * @param date - The date to format
 * @returns Formatted date string in "Month Day, Year" format (e.g., "January 15, 2024")
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date'
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Extracts initials from a full name
 * @param name - The full name to extract initials from
 * @returns Initials (up to 2 characters) in uppercase
 * @example
 * getInitials("John Doe") // returns "JD"
 * getInitials("Alice") // returns "A"
 */
export function getInitials(name: string): string {
  if (!name || name.trim().length === 0) {
    return '?'
  }
  
  const parts = name.trim().split(/\s+/)
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Retrieves the flag emoji for a given country code or name
 * @param country - The country code (ISO 3166-1 alpha-2) or country name
 * @returns Flag emoji for the country, or a globe emoji if not found
 * @example
 * getCountryFlag("US") // returns "🇺🇸"
 * getCountryFlag("United States") // returns "🇺🇸"
 */
export function getCountryFlag(country: string): string {
  if (!country) {
    return '🌐'
  }
  
  // Map of common country names to ISO codes
  const countryNameToCode: Record<string, string> = {
    'united states': 'US',
    'usa': 'US',
    'united kingdom': 'GB',
    'uk': 'GB',
    'canada': 'CA',
    'australia': 'AU',
    'germany': 'DE',
    'france': 'FR',
    'spain': 'ES',
    'italy': 'IT',
    'japan': 'JP',
    'china': 'CN',
    'india': 'IN',
    'brazil': 'BR',
    'mexico': 'MX',
    'netherlands': 'NL',
    'sweden': 'SE',
    'norway': 'NO',
    'denmark': 'DK',
    'finland': 'FI',
    'poland': 'PL',
    'portugal': 'PT',
    'greece': 'GR',
    'turkey': 'TR',
    'south korea': 'KR',
    'singapore': 'SG',
    'new zealand': 'NZ',
    'ireland': 'IE',
    'switzerland': 'CH',
    'austria': 'AT',
    'belgium': 'BE',
    'argentina': 'AR',
    'chile': 'CL',
    'colombia': 'CO',
    'south africa': 'ZA',
    'egypt': 'EG',
    'israel': 'IL',
    'saudi arabia': 'SA',
    'uae': 'AE',
    'united arab emirates': 'AE',
    'russia': 'RU',
    'ukraine': 'UA',
    'czech republic': 'CZ',
    'romania': 'RO',
    'hungary': 'HU',
    'thailand': 'TH',
    'vietnam': 'VN',
    'philippines': 'PH',
    'indonesia': 'ID',
    'malaysia': 'MY',
    'pakistan': 'PK',
    'bangladesh': 'BD',
  }
  
  // Check if it's already a 2-letter code
  let countryCode = country.toUpperCase()
  
  // If it's longer than 2 characters, try to find the code from the name
  if (countryCode.length > 2) {
    const normalizedName = country.toLowerCase().trim()
    countryCode = countryNameToCode[normalizedName] || ''
  }
  
  // Validate it's a 2-letter code
  if (countryCode.length !== 2 || !/^[A-Z]{2}$/.test(countryCode)) {
    return '🌐'
  }
  
  // Convert country code to flag emoji
  // Flag emojis are created using regional indicator symbols
  // A = U+1F1E6, B = U+1F1E7, etc.
  const codePoints = [...countryCode].map(char => 
    0x1F1E6 + char.charCodeAt(0) - 'A'.charCodeAt(0)
  )
  
  return String.fromCodePoint(...codePoints)
}

/**
 * Formats a phone number with country code
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) {
    return ''
  }
  
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '')
  
  // If it starts with a country code (more than 10 digits), format accordingly
  if (digits.length > 10) {
    const countryCode = digits.slice(0, digits.length - 10)
    const areaCode = digits.slice(-10, -7)
    const firstPart = digits.slice(-7, -4)
    const secondPart = digits.slice(-4)
    return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`
  }
  
  // Standard US format
  if (digits.length === 10) {
    const areaCode = digits.slice(0, 3)
    const firstPart = digits.slice(3, 6)
    const secondPart = digits.slice(6)
    return `(${areaCode}) ${firstPart}-${secondPart}`
  }
  
  return phoneNumber
}

/**
 * Validates if a date is valid
 * @param date - The date to validate
 * @returns True if the date is valid, false otherwise
 */
export function isValidDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return !isNaN(dateObj.getTime())
}
