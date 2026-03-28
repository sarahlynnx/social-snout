export const DEFAULT_RADIUS_MILES = 10;

export const PET_TYPES = ["DOG", "CAT"] as const;

export const PET_SIZES = ["SMALL", "MEDIUM", "LARGE"] as const;

export const PET_SIZE_LABELS: Record<string, string> = {
  SMALL: "Small (0-25 lbs)",
  MEDIUM: "Medium (25-60 lbs)",
  LARGE: "Large (60+ lbs)",
};

export const PET_AGE_OPTIONS = [
  { label: "Less than 1 year", value: "<1" },
  { label: "1 year", value: "1" },
  { label: "2 years", value: "2" },
  { label: "3 years", value: "3" },
  { label: "4 years", value: "4" },
  { label: "5 years", value: "5" },
  { label: "6 years", value: "6" },
  { label: "7 years", value: "7" },
  { label: "8 years", value: "8" },
  { label: "9 years", value: "9" },
  { label: "10+ years", value: "10+" },
] as const;

export const DOG_BREEDS = [
  "Akita",
  "Australian Shepherd",
  "Beagle",
  "Bernese Mountain Dog",
  "Bichon Frise",
  "Border Collie",
  "Boston Terrier",
  "Boxer",
  "Bulldog",
  "Cane Corso",
  "Cavalier King Charles Spaniel",
  "Chihuahua",
  "Chow Chow",
  "Cocker Spaniel",
  "Corgi",
  "Dachshund",
  "Dalmatian",
  "Doberman",
  "English Springer Spaniel",
  "German Shepherd",
  "Golden Retriever",
  "Great Dane",
  "Great Pyrenees",
  "Greyhound",
  "Havanese",
  "Jack Russell Terrier",
  "Labrador Retriever",
  "Maltese",
  "Mastiff",
  "Miniature Schnauzer",
  "Pit Bull",
  "Pomeranian",
  "Poodle",
  "Pug",
  "Rottweiler",
  "Saint Bernard",
  "Samoyed",
  "Shetland Sheepdog",
  "Shiba Inu",
  "Shih Tzu",
  "Siberian Husky",
  "Yorkshire Terrier",
  "Mixed",
  "Other",
] as const;

export const CAT_BREEDS = [
  "Abyssinian",
  "American Shorthair",
  "Bengal",
  "Birman",
  "British Shorthair",
  "Burmese",
  "Devon Rex",
  "Exotic Shorthair",
  "Himalayan",
  "Maine Coon",
  "Munchkin",
  "Norwegian Forest Cat",
  "Persian",
  "Ragdoll",
  "Russian Blue",
  "Scottish Fold",
  "Siamese",
  "Siberian",
  "Sphynx",
  "Tonkinese",
  "Mixed",
  "Other",
] as const;

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

export const PET_PROMPTS = [
  "My favorite thing is...",
  "I get the zoomies when...",
  "My ideal playdate is...",
  "You should know that I...",
  "My favorite treat is...",
  "My favorite toy is...",
  "I'm scared of...",
  "My hidden talent is...",
  "I love to nap...",
  "My best trick is...",
] as const;

export const MAX_PET_PROMPTS = 3;

export const POST_TYPES = ["GENERAL", "LOST_PET", "EVENT", "PHOTO"] as const;

export const REACTION_TYPES = ["LIKE", "HEART", "LAUGH", "WOW"] as const;
