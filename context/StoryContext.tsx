import React, { createContext, useContext, useState, useEffect } from "react";
import { Story, Chapter } from "../types/story";
import { getStories, saveStory } from '../utils/storage';

type StoryContextType = {
    stories: Story[];
    addStory: (story: Story) => void;
    addChapterToStory: (storyId:string, chapter: Chapter) => void;
    currentStory: Story | null;
    setCurrentStory: (story: Story | null) => void;
    refreshStories: () => Promise<void>;
}
const StoryContext = createContext<StoryContextType>({
    stories: [],
    addStory: () => {},
    addChapterToStory: () => {},
    currentStory: null,
    setCurrentStory: () => {},
    refreshStories: async () => {}
})

export const StoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [stories, setStories] = useState<Story[]>([]);
    const [currentStory, setCurrentStory] = useState<Story | null>(null);


    useEffect(() => {
        refreshStories();
    }, []);

    const addStory = (story: Story) => {
        setStories(prev => [...prev, story]);
        setCurrentStory(story);
    };

    const refreshStories = async () => {
        const loadedStories = await getStories();
        setStories(loadedStories);
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
             refreshStories,
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