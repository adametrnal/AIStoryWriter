export interface Story {
    id: string;
    characterName: string;
    characterType: string;
    ageRange: string;
    createdAt: number;
    chapters: Chapter[];
  }

  export interface Chapter {
    content: string;
    number: number;
  }