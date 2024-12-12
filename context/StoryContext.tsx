import React, { createContext, useContext, useState, useEffect } from "react";
import { Story, Chapter } from "../types/story";
import Constants from 'expo-constants';
import axios from 'axios';
import { useAuth } from "@/app/services/authService";

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

export function StoryProvider({ children }: { children: React.ReactNode }) {
    const [stories, setStories] = useState<Story[]>([]);
    const [currentStory, setCurrentStory] = useState<Story | null>(null);
    const { session } = useAuth();
  
    useEffect(() => {
        if(session?.user){
            refreshStories();
        }
    }, [session?.user?.id]);
  

    const refreshStories = async () => {

        if(!session?.user){
            console.log("No user session");
            return;
        }

        try {
            const fullURL = `${Constants.expoConfig?.extra?.functionsUrl}get-stories`;
            console.log("Attempting to fetch stories from:", fullURL);
            console.log("Using user ID:", session.user.id);
            const response = await axios.post(fullURL, {
                userId: session.user.id
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Constants.expoConfig?.extra?.publicSupabaseAnonKey}`
                }
            });


            console.log("stories response", response.data);
            const loadedStories = response.data.stories;
            setStories(loadedStories);
          } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Axios Error:', {
                    message: error.message,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    responseData: error.response?.data,
                    requestURL: error.config?.url,
                    requestHeaders: error.config?.headers
                });
            } else {
                console.error('Unexpected Error:', error);
            }
          }
    };
  
    const addStory = async (story: Story) => {
        setStories(prev => [...prev, story]);
    };
  
    const addChapterToStory = async (storyId: string, chapter: Chapter) => {
        setStories(prev => prev.map(story => 
          story.id === storyId 
            ? { ...story, chapters: [...story.chapters, chapter] }
            : story
        ));

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