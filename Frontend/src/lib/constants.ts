import {
  SubscriptionPlan,
  Genre,
  EnhancedSubscriptionPlan,
  AnimationConfig,
  ComparisonFeature,
  TrustIndicator,
  FAQItem,
  EnterpriseContact,
} from "../types";

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free Plan",
    price: 0,
    currency: "USD",
    billing: "monthly",
    freeTrial: 14,
    features: {
      profiles: 1,
      maxDevices: 1,
      quality: "SD",
      fullLibrary: false,
      offlineDownloads: false,
      adFree: false,
      groupWatch: false,
      prioritySupport: false,
      kidsProfiles: false,
      earlyAccess: false,
    },
  },
  {
    id: "basic",
    name: "Basic Plan",
    price: 4.99,
    currency: "USD",
    billing: "monthly",
    freeTrial: 14,
    features: {
      profiles: 2,
      maxDevices: 2,
      quality: "720p",
      fullLibrary: false,
      offlineDownloads: false,
      adFree: false,
      groupWatch: false,
      prioritySupport: false,
      kidsProfiles: false,
      earlyAccess: false,
    },
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: 9.99,
    currency: "USD",
    billing: "monthly",
    features: {
      profiles: 3,
      maxDevices: 3,
      quality: "1080p",
      fullLibrary: true,
      offlineDownloads: 3,
      adFree: true,
      groupWatch: true,
      prioritySupport: true,
      kidsProfiles: true,
      earlyAccess: false,
    },
  },
  {
    id: "family",
    name: "Family Plan",
    price: 15.99,
    currency: "USD",
    billing: "monthly",
    features: {
      profiles: 5,
      maxDevices: 5,
      quality: "4K UHD",
      fullLibrary: true,
      offlineDownloads: 10,
      adFree: true,
      groupWatch: true,
      prioritySupport: true,
      kidsProfiles: true,
      earlyAccess: true,
    },
  },
];

export const ENHANCED_SUBSCRIPTION_PLANS: EnhancedSubscriptionPlan[] = [
  {
    id: "free",
    name: "Free Plan",
    price: 0,
    currency: "USD",
    billing: "monthly",
    freeTrial: 14,
    description: "Get started with basic streaming features at no cost",
    icon: "Play",
    gradient: {
      from: "#6b7280",
      to: "#4b5563",
    },
    ctaText: "Get Started",
    features: {
      profiles: 1,
      maxDevices: 1,
      quality: "SD",

      fullLibrary: false,
      offlineDownloads: false,
      adFree: false,
      groupWatch: false,
      prioritySupport: false,
      kidsProfiles: false,
      earlyAccess: false,
    },
    featureList: [
      "Limited content library",
      "1 user profile",
      "SD quality streaming",
      "Watch on 1 device",
      "Ads included",
      "14-day free trial",
    ],
  },
  {
    id: "basic",
    name: "Basic Plan",
    price: 4.99,
    yearlyPrice: 49.99,
    yearlyDiscount: 17,
    currency: "USD",
    billing: "monthly",
    freeTrial: 14,
    description: "Essential streaming with HD quality and multiple devices",
    icon: "Monitor",
    gradient: {
      from: "#3b82f6",
      to: "#1d4ed8",
    },
    ctaText: "Start Trail",
    features: {
      profiles: 2,
      maxDevices: 2,
      quality: "720p",
      fullLibrary: false,
      offlineDownloads: false,
      adFree: false,
      groupWatch: false,
      prioritySupport: false,
      kidsProfiles: false,
      earlyAccess: false,
    },
    featureList: [
      "Extended content library",
      "2 user profiles",
      "HD quality streaming",
      "Watch on 2 devices",
      "Limited ads",
      "14-day free trial",
    ],
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: 9.99,
    yearlyPrice: 99.99,
    yearlyDiscount: 17,
    currency: "USD",
    billing: "monthly",
    popularBadge: true,
    description: "Full HD streaming with complete library access and downloads",
    icon: "Crown",
    gradient: {
      from: "#8b5cf6",
      to: "#7c3aed",
    },
    ctaText: "Choose Premium",
    features: {
      profiles: 3,
      maxDevices: 3,
      quality: "1080p",
      fullLibrary: true,
      offlineDownloads: 3,
      adFree: true,
      groupWatch: true,
      prioritySupport: true,
      kidsProfiles: true,
      earlyAccess: false,
    },
    featureList: [
      "Complete content library",
      "3 user profiles",
      "Full HD streaming",
      "Watch on 3 devices",
      "Ad-free experience",
      "Download up to 3 titles",
      "Group watch feature",
      "Kids profiles",
      "Priority support",
    ],
  },
  {
    id: "family",
    name: "Family Plan",
    price: 15.99,
    yearlyPrice: 159.99,
    yearlyDiscount: 17,
    currency: "USD",
    billing: "monthly",
    description:
      "Ultimate 4K experience with unlimited profiles and early access",
    icon: "Users",
    gradient: {
      from: "#f59e0b",
      to: "#d97706",
    },
    ctaText: "Choose Family",
    features: {
      profiles: 5,
      maxDevices: 5,
      quality: "4K UHD",
      fullLibrary: true,
      offlineDownloads: 10,
      adFree: true,
      groupWatch: true,
      prioritySupport: true,
      kidsProfiles: true,
      earlyAccess: true,
    },
    featureList: [
      "Complete content library",
      "5 user profiles",
      "4K UHD streaming",
      "Watch on 5 devices",
      "Ad-free experience",
      "Download up to 10 titles",
      "Group watch feature",
      "Kids profiles with parental controls",
      "Priority support",
      "Early access to new releases",
    ],
  },
];

export const ANIMATION_CONFIG: AnimationConfig = {
  duration: {
    entrance: 0.8,
    hover: 0.3,
    transition: 0.6,
  },
  easing: {
    entrance: "power2.out",
    hover: "power2.out",
    transition: "power2.inOut",
  },
  stagger: {
    cards: 0.1,
    features: 0.05,
    tableRows: 0.08,
  },
};

// Additional animation constants for specific components
export const PRICING_ANIMATIONS = {
  // Page entrance timeline
  pageEntrance: {
    headerDelay: 0,
    toggleDelay: 0.4,
    cardsDelay: 0.3,
    tableDelay: 0.6,
    trustIndicatorsDelay: 0.8,
    faqDelay: 1.0,
  },

  // Card animations
  card: {
    hoverScale: 1.02,
    hoverY: -8,
    glowOpacity: 0.6,
    shadowHover: "0 20px 40px rgba(0,0,0,0.3)",
    shadowDefault: "0 4px 12px rgba(0,0,0,0.1)",
    popularBadgeScale: 1.05,
    selectionScale: 1.03,
    featureStagger: 0.05,
  },

  // Billing toggle animations
  toggle: {
    switchDuration: 0.3,
    priceScaleDuration: 0.2,
    priceRestoreDuration: 0.3,
    savingsBadgeDuration: 0.4,
    savingsBadgeEase: "back.out(1.7)",
    toggleEase: "power2.inOut",
    priceUpdateEase: "back.out(1.7)",
  },

  // Comparison table animations
  table: {
    rowStagger: 0.08,
    cellStagger: 0.03,
    hoverScale: 1.01,
    checkmarkDelay: 0.1,
    featureHighlightDuration: 0.2,
  },

  // FAQ accordion animations
  faq: {
    expandDuration: 0.4,
    collapseDuration: 0.3,
    contentFadeDelay: 0.1,
    iconRotationDuration: 0.3,
    itemStagger: 0.15,
  },

  // Trust indicators animations
  trustIndicators: {
    badgeStagger: 0.1,
    hoverScale: 1.05,
    glowIntensity: 0.4,
    entranceDelay: 0.2,
  },

  // Scroll trigger thresholds
  scrollTriggers: {
    comparisonTable: "top 80%",
    faqSection: "top 85%",
    trustIndicators: "top 90%",
    enterpriseContact: "top 75%",
  },

  // Performance settings
  performance: {
    targetFPS: 60,
    reducedMotionFallback: true,
    mobileOptimization: true,
    memoryCleanup: true,
    batchAnimations: true,
  },

  // Responsive breakpoints for animations
  responsive: {
    mobile: {
      reduceStagger: 0.5,
      simplifyHovers: true,
      disableParallax: true,
    },
    tablet: {
      reduceStagger: 0.8,
      simplifyHovers: false,
      disableParallax: false,
    },
    desktop: {
      reduceStagger: 1,
      simplifyHovers: false,
      disableParallax: false,
    },
  },
};

export const GENRES: Genre[] = [
  { id: "action", name: "Action", slug: "action" },
  { id: "comedy", name: "Comedy", slug: "comedy" },
  { id: "drama", name: "Drama", slug: "drama" },
  { id: "sci-fi", name: "Sci-Fi", slug: "sci-fi" },
  { id: "thriller", name: "Thriller", slug: "thriller" },
  { id: "romance", name: "Romance", slug: "romance" },
  { id: "horror", name: "Horror", slug: "horror" },
  { id: "mystery", name: "Mystery", slug: "mystery" },
  { id: "documentary", name: "Documentary", slug: "documentary" },
  { id: "family", name: "Family", slug: "family" },
  { id: "animation", name: "Animation", slug: "animation" },
  { id: "fantasy", name: "Fantasy", slug: "fantasy" },
  { id: "crime", name: "Crime", slug: "crime" },
  { id: "adventure", name: "Adventure", slug: "adventure" },
  { id: "war", name: "War", slug: "war" },
  { id: "western", name: "Western", slug: "western" },
  { id: "musical", name: "Musical", slug: "musical" },
  { id: "biography", name: "Biography", slug: "biography" },
  { id: "history", name: "History", slug: "history" },
  { id: "sport", name: "Sport", slug: "sport" },
];

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "hi", name: "Hindi" },
  { code: "te", name: "Telugu" },
  { code: "ta", name: "Tamil" },
  { code: "ko", name: "Korean" },
  { code: "ja", name: "Japanese" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "ru", name: "Russian" },
];

export const CONTENT_RATINGS = [
  "G",
  "PG",
  "PG-13",
  "R",
  "NC-17",
  "TV-Y",
  "TV-Y7",
  "TV-G",
  "TV-PG",
  "TV-14",
  "TV-MA",
];

export const VIDEO_QUALITIES = [
  { id: "sd", name: "SD", resolution: "480p" },
  { id: "hd", name: "HD", resolution: "720p" },
  { id: "fhd", name: "Full HD", resolution: "1080p" },
  { id: "4k", name: "4K UHD", resolution: "2160p" },
];

export const COLLECTION_TYPES = [
  { id: "trending", name: "Trending Now" },
  { id: "new", name: "Recently Added" },
  { id: "popular", name: "Most Watched" },
  { id: "top-rated", name: "Top Rated" },
  { id: "continue-watching", name: "Continue Watching" },
  { id: "watch-again", name: "Watch Again" },
  { id: "award-winners", name: "Award Winners" },
  { id: "marvel", name: "Marvel Universe" },
  { id: "dc", name: "DC Extended Universe" },
  { id: "oscar-winners", name: "Oscar Winners" },
  { id: "bollywood", name: "Bollywood Hits" },
  { id: "korean-dramas", name: "Korean Dramas" },
  { id: "documentaries", name: "Documentaries" },
  { id: "international", name: "International Shows" },
  { id: "kids", name: "Kids & Family" },
];

export const NAVIGATION_ITEMS = [
  { name: "Home", href: "/", icon: "Home" },
  { name: "Movies", href: "/movies", icon: "Film" },
  { name: "TV Shows", href: "/tv-shows", icon: "Tv" },
  { name: "My List", href: "/my-list", icon: "Bookmark" },
  { name: "Browse", href: "/browse", icon: "Search" },
];

export const FOOTER_LINKS = {
  company: [
    { name: "About Us", href: "/about" },
    // { name: "Careers", href: "/careers" },
    { name: "Press", href: "/press" },
    { name: "Blog", href: "/blog" },
  ],
  support: [
    { name: "Help Center", href: "/help" },
    { name: "Contact Us", href: "/contact" },
    { name: "Account", href: "/user/profile" },
    // { name: "Redeem Gift Cards", href: "/gift-cards" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    // { name: "Cookie Policy", href: "/cookies" },
    { name: "Content Guidelines", href: "/guidelines" },
  ],
  social: [
    {
      name: "Facebook",
      href: "https://facebook.com/cinestream",
      icon: "Facebook",
    },
    {
      name: "Twitter",
      href: "https://twitter.com/cinestream",
      icon: "Twitter",
    },
    {
      name: "Instagram",
      href: "https://instagram.com/cinestream",
      icon: "Instagram",
    },
    {
      name: "YouTube",
      href: "https://youtube.com/cinestream",
      icon: "Youtube",
    },
  ],
};

export const CONTACT_INFO = {
  email: "support@cinestream.com",
  phone: "+1 (555) 123-4567",
  address: "123 Streaming Ave, Los Angeles, CA 90210",
  supportHours: "24/7",
  responseTime: "24-48 hours",
};

// Subscription page specific constants
export const SUBSCRIPTION_PAGE_CONFIG = {
  // Feature comparison table data
  comparisonFeatures: [
    {
      id: "content-library",
      name: "Content Library",
      description: "Access to movies and TV shows",
      type: "text" as const,
    },
    {
      id: "video-quality",
      name: "Video Quality",
      description: "Maximum streaming resolution",
      type: "text" as const,
    },
    {
      id: "simultaneous-streams",
      name: "Simultaneous Streams",
      description: "Number of devices that can stream at once",
      type: "number" as const,
    },
    {
      id: "user-profiles",
      name: "User Profiles",
      description: "Individual user accounts",
      type: "number" as const,
    },
    {
      id: "offline-downloads",
      name: "Offline Downloads",
      description: "Download content for offline viewing",
      type: "text" as const,
    },
    {
      id: "ad-free",
      name: "Ad-Free Experience",
      description: "Watch without advertisements",
      type: "boolean" as const,
    },
    {
      id: "group-watch",
      name: "Group Watch",
      description: "Watch together with friends remotely",
      type: "boolean" as const,
    },
    {
      id: "kids-profiles",
      name: "Kids Profiles",
      description: "Child-safe content filtering",
      type: "boolean" as const,
    },
    {
      id: "priority-support",
      name: "Priority Support",
      description: "Faster customer service response",
      type: "boolean" as const,
    },
    {
      id: "early-access",
      name: "Early Access",
      description: "New releases before general availability",
      type: "boolean" as const,
    },
  ],

  // Trust indicators and security badges
  trustIndicators: [
    {
      id: "ssl-secure",
      name: "SSL Secured",
      icon: "Shield",
      description: "Your data is protected with 256-bit SSL encryption",
    },
    {
      id: "gdpr-compliant",
      name: "GDPR Compliant",
      icon: "CheckCircle",
      description: "Full compliance with European data protection regulations",
    },
    {
      id: "pci-dss",
      name: "PCI DSS Certified",
      icon: "CreditCard",
      description: "Secure payment processing standards",
    },
    {
      id: "money-back",
      name: "30-Day Money Back",
      icon: "RefreshCw",
      description: "Full refund within 30 days, no questions asked",
    },
  ],

  // FAQ data
  faqItems: [
    {
      id: "what-is-included",
      question: "What's included in each subscription plan?",
      answer:
        "Each plan includes access to our streaming library with different features. Free plan offers limited content with ads, Basic includes HD streaming, Premium adds full library access and downloads, while Family provides 4K streaming and multiple profiles.",
    },
    {
      id: "billing-cycle",
      question: "Can I switch between monthly and yearly billing?",
      answer:
        "Yes, you can change your billing cycle at any time. Yearly subscriptions offer significant savings with up to 17% discount compared to monthly billing.",
    },
    {
      id: "free-trial",
      question: "How does the free trial work?",
      answer:
        "Most paid plans include a 14-day free trial. You can cancel anytime during the trial period without being charged. After the trial, your subscription will automatically continue.",
    },
    {
      id: "cancel-anytime",
      question: "Can I cancel my subscription anytime?",
      answer:
        "Absolutely! You can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your current billing period.",
    },
    {
      id: "device-compatibility",
      question: "What devices are supported?",
      answer:
        "CineStream works on all major devices including smartphones, tablets, computers, smart TVs, gaming consoles, and streaming devices like Roku and Apple TV.",
    },
    {
      id: "family-sharing",
      question: "How does family sharing work?",
      answer:
        "Family plans allow up to 5 individual profiles with personalized recommendations and watch history. Kids profiles include parental controls and age-appropriate content filtering.",
    },
  ],

  // Enterprise contact information
  enterpriseContact: {
    title: "Enterprise Solutions",
    subtitle: "Custom pricing for organizations",
    description:
      "Get volume discounts, advanced admin controls, and dedicated support for your organization.",
    features: [
      "Volume pricing discounts",
      "Advanced admin dashboard",
      "Single sign-on (SSO) integration",
      "Dedicated account manager",
      "Custom content licensing",
      "Priority technical support",
    ],
    ctaText: "Contact Sales",
    email: "enterprise@cinestream.com",
    phone: "+1 (555) 123-4567",
  },
};
