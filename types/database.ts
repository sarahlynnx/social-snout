export type PetType = "DOG" | "CAT";
export type PetSize = "SMALL" | "MEDIUM" | "LARGE";
export type SwipeDirection = "RIGHT" | "LEFT";
export type PostType = "GENERAL" | "LOST_PET" | "EVENT" | "PHOTO";
export type ReactionType = "LIKE" | "HEART" | "LAUGH" | "WOW";

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
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string;
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
