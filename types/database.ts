export type PetPrompt = { question: string; answer: string };

export type PetType = "DOG" | "CAT";
export type PetSize = "SMALL" | "MEDIUM" | "LARGE";
export type SwipeDirection = "RIGHT" | "LEFT";
export type PostType = "GENERAL" | "LOST_PET" | "EVENT" | "PHOTO";
export type ReactionType = "HEART" | "LAUGH" | "WOW" | "IDEA" | "SAD";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          location: unknown | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          location?: unknown | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
          location?: unknown | null;
          created_at?: string;
        };
        Relationships: [];
      };
      pets: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          type: PetType;
          breed: string | null;
          age: number;
          size: PetSize;
          bio: string | null;
          photos: string[];
          tags: string[];
          prompts: PetPrompt[];
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          type: PetType;
          breed?: string | null;
          age: number;
          size: PetSize;
          bio?: string | null;
          photos?: string[];
          tags?: string[];
          prompts?: PetPrompt[];
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          type?: PetType;
          breed?: string | null;
          age?: number;
          size?: PetSize;
          bio?: string | null;
          photos?: string[];
          tags?: string[];
          prompts?: PetPrompt[];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pets_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      swipes: {
        Row: {
          id: string;
          swiper_id: string;
          pet_id: string;
          direction: SwipeDirection;
          created_at: string;
        };
        Insert: {
          id?: string;
          swiper_id: string;
          pet_id: string;
          direction: SwipeDirection;
          created_at?: string;
        };
        Update: {
          id?: string;
          swiper_id?: string;
          pet_id?: string;
          direction?: SwipeDirection;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "swipes_swiper_id_fkey";
            columns: ["swiper_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "swipes_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
        ];
      };
      matches: {
        Row: {
          id: string;
          pet_a_id: string;
          pet_b_id: string;
          user_a_id: string;
          user_b_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          pet_a_id: string;
          pet_b_id: string;
          user_a_id: string;
          user_b_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          pet_a_id?: string;
          pet_b_id?: string;
          user_a_id?: string;
          user_b_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "matches_pet_a_id_fkey";
            columns: ["pet_a_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_pet_b_id_fkey";
            columns: ["pet_b_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_user_a_id_fkey";
            columns: ["user_a_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_user_b_id_fkey";
            columns: ["user_b_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          match_id: string;
          sender_id: string;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          sender_id: string;
          content: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          sender_id?: string;
          content?: string;
          read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          pet_id: string | null;
          content: string;
          images: string[];
          type: PostType;
          location: unknown | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          pet_id?: string | null;
          content: string;
          images?: string[];
          type?: PostType;
          location?: unknown | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          pet_id?: string | null;
          content?: string;
          images?: string[];
          type?: PostType;
          location?: unknown | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          pet_id: string | null;
          parent_comment_id: string | null;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          pet_id?: string | null;
          parent_comment_id?: string | null;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string;
          pet_id?: string | null;
          parent_comment_id?: string | null;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_parent_comment_id_fkey";
            columns: ["parent_comment_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
        ];
      };
      reactions: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          type: ReactionType;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          type: ReactionType;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          type?: ReactionType;
        };
        Relationships: [
          {
            foreignKeyName: "reactions_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      matching_preferences: {
        Row: {
          id: string;
          user_id: string;
          pet_types: PetType[];
          sizes: PetSize[];
          age_min: number;
          age_max: number;
          required_tags: string[];
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pet_types?: PetType[];
          sizes?: PetSize[];
          age_min?: number;
          age_max?: number;
          required_tags?: string[];
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pet_types?: PetType[];
          sizes?: PetSize[];
          age_min?: number;
          age_max?: number;
          required_tags?: string[];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "matching_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      comment_reactions: {
        Row: {
          id: string;
          comment_id: string;
          user_id: string;
          type: ReactionType;
        };
        Insert: {
          id?: string;
          comment_id: string;
          user_id: string;
          type: ReactionType;
        };
        Update: {
          id?: string;
          comment_id?: string;
          user_id?: string;
          type?: ReactionType;
        };
        Relationships: [
          {
            foreignKeyName: "comment_reactions_comment_id_fkey";
            columns: ["comment_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {};
    Functions: {
      nearby_users: {
        Args: {
          lat: number;
          lng: number;
          radius_miles?: number;
        };
        Returns: Database["public"]["Tables"]["users"]["Row"][];
      };
      nearby_posts: {
        Args: {
          lat: number;
          lng: number;
          radius_miles?: number;
        };
        Returns: Database["public"]["Tables"]["posts"]["Row"][];
      };
      handle_swipe: {
        Args: {
          p_swiper_pet_id: string;
          p_swiped_pet_id: string;
          p_direction: SwipeDirection;
        };
        Returns: { matched: boolean; match_id: string | null };
      };
      get_swipeable_pets: {
        Args: {
          p_pet_id: string;
          p_limit?: number;
        };
        Returns: SwipeablePet[];
      };
      nearby_post_ids: {
        Args: {
          lat: number;
          lng: number;
          radius_miles?: number;
          cursor_created_at?: string | null;
          page_size?: number;
          p_type?: PostType | null;
        };
        Returns: { post_id: string }[];
      };
      get_matches_with_messages: {
        Args: {
          p_user_id: string;
        };
        Returns: MatchWithMessages[];
      };
    };
    Enums: {
      pet_type: PetType;
      pet_size: PetSize;
      swipe_direction: SwipeDirection;
      post_type: PostType;
      reaction_type: ReactionType;
    };
    CompositeTypes: {};
  };
}

// Convenience type aliases
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Pet = Database["public"]["Tables"]["pets"]["Row"];
export type Swipe = Database["public"]["Tables"]["swipes"]["Row"];
export type Match = Database["public"]["Tables"]["matches"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type Reaction = Database["public"]["Tables"]["reactions"]["Row"];
export type CommentReaction = Database["public"]["Tables"]["comment_reactions"]["Row"];
export type MatchingPreferences = Database["public"]["Tables"]["matching_preferences"]["Row"];

export type SwipeablePet = Pet & {
  owner_name: string;
  owner_avatar_url: string | null;
};

export type MatchWithProfiles = Match & {
  pet: Pet;
  owner: Pick<User, "id" | "name" | "avatar_url">;
};

export type PostWithDetails = Post & {
  pet: Pet | null;
  author: Pick<User, "id" | "name" | "avatar_url">;
  reactions: Reaction[];
  comments: { count: number }[];
};

export type CommentWithPet = Comment & {
  pet: Pet | null;
  author: Pick<User, "id" | "name" | "avatar_url">;
  comment_reactions: CommentReaction[];
  replies?: CommentWithPet[];
};

export type MatchWithMessages = {
  id: string;
  pet_a_id: string;
  pet_b_id: string;
  user_a_id: string;
  user_b_id: string;
  created_at: string;
  pet_name: string;
  pet_photo: string | null;
  owner_name: string;
  owner_avatar: string | null;
  last_message_content: string | null;
  last_message_at: string | null;
  unread_count: number;
};
