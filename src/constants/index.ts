export const GENRES = [
  'Electronic',
  'Hip Hop',
  'R&B',
  'Pop',
  'Rock',
  'Jazz',
  'Classical',
  'Deep House',
  'Techno',
  'Ambient',
  'Synthwave',
  'Experimental',
] as const

export const MOOD_TAGS = [
  'Energetic',
  'Dark',
  'Uplifting',
  'Melancholic',
  'Hypnotic',
  'Cinematic',
  'Groovy',
  'Atmospheric',
  'Aggressive',
  'Chill',
  'Nostalgic',
  'Abstract',
] as const

export const WIZARD_STEPS = ['Track Details', 'Artwork', 'Economics', 'Review & Mint'] as const

export const APP_CONFIG = {
  name: 'AudiFi',
  tagline: 'Own Your Music. Share the Success.',
  maxMoodTags: 5,
  maxFileSize: {
    audio: 100 * 1024 * 1024,
    image: 10 * 1024 * 1024,
  },
  defaultRoyaltyPercent: 10,
} as const
