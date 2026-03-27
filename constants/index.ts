export const DEFAULT_RADIUS_MILES = 10;

export const PET_TYPES = ["DOG", "CAT"] as const;

export const PET_SIZES = ["SMALL", "MEDIUM", "LARGE"] as const;

export const PET_SIZE_LABELS: Record<string, string> = {
  SMALL: "Small (0-25 lbs)",
  MEDIUM: "Medium (25-60 lbs)",
  LARGE: "Large (60+ lbs)",
};

export const TEMPERAMENT_TAGS = [
  "Friendly",
  "Playful",
  "Calm",
  "Energetic",
  "Shy",
  "Protective",
  "Good with kids",
  "Good with dogs",
  "Good with cats",
  "Vaccinated",
  "Neutered/Spayed",
  "Trained",
] as const;

export const MAX_PET_PHOTOS = 6;

export const POST_TYPES = ["GENERAL", "LOST_PET", "EVENT", "PHOTO"] as const;

export const REACTION_TYPES = ["LIKE", "HEART", "LAUGH", "WOW"] as const;
