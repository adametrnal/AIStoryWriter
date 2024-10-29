import React, { createContext, useContext, useState } from "react";

type Chapter= {
    content: string;
    number: number;
}

type Story = {
    id: string;
    characterName: string;
    characterType: string;
    ageRange: string;
    chapters: Chapter[];
}

type StoryContextType = {
    stories: Story[];
    addStory: (story: Story) => void;
    addChapterToStory: (storyId:string, chapter: Chapter) => void;
    currentStory: Story | null;
    setCurrentStory: (story: Story | null) => void;
}
const StoryContext = createContext<StoryContextType | undefined>(undefined);

export const StoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [stories, setStories] = useState<Story[]>([]);
    const [currentStory, setCurrentStory] = useState<Story | null>(null);

    const addStory = (story: Story) => {
        setStories(prev => [...prev, story]);
        setCurrentStory(story);
    };

    const addChapterToStory = (storyId: string, chapter: Chapter) => {
        setStories(prev => prev.map(story =>
            story.id === storyId
            ? { ...story, chapters: [...story.chapters, chapter] }
            : story
        ));

        if (currentStory?.id === storyId) {
            setCurrentStory(prev => prev ? {
                ...prev,
                chapters: [...prev.chapters, chapter]
            } : null);
        }
    };

    return (
        <StoryContext.Provider value={{
             stories, 
             addStory, 
             addChapterToStory,
             currentStory,
             setCurrentStory }}>
            {children}
        </StoryContext.Provider>
    );
};

export const useStory = () => {
    const context = useContext(StoryContext);
    if (!context) {
        throw new Error('useStory must be used within a StoryProvider');
    }
    return context;
};