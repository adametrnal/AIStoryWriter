export interface Story {
    id?: string;
    user_id: string;
    character_name: string;
    character_type: string;
    descriptor: string;
    age_range: string;
    genre: string;
    title: string;
    character_description: string;
    chapters: Chapter[];
    created_at?: number;
  }

  export interface Chapter {
    id?: string;
    user_id?: string;
    story_id?: string;
    content: string;
    number: number;
    title: string;
    illustration_url: string;
    audio_url: string;
    timestamps_url: string;
    created_at?: string;
  }
