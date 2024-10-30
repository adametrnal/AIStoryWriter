export interface Story {
    id: string;
    characterName: string;
    characterType: string;
    ageRange: string;
    createdAt: number;
    title: string;
    chapters: Chapter[];
  }

  export interface Chapter {
    content: string;
    number: number;
    title: string;
  }