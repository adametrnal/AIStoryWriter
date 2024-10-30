import AsyncStorage from '@react-native-async-storage/async-storage';
import { Story, Chapter } from '../types/story';

const STORAGE_KEY = 'user_stories';

export const saveStory = async (story: Story) => {
    try {
        const existingStoriesJSON = await AsyncStorage.getItem(STORAGE_KEY);
        const existingStories: Story[] = existingStoriesJSON ? JSON.parse(existingStoriesJSON) : [];

        const updatedStories = [...existingStories, story];
        console.log('saving stories', updatedStories);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStories));
    } catch (error) {
        console.error('Error saving story:', error);
    }
}

export const saveChapter = async (storyId: string, chapter: Chapter) => {
    try {
        const existingStoriesJSON = await AsyncStorage.getItem(STORAGE_KEY);
        const existingStories: Story[] = existingStoriesJSON ? JSON.parse(existingStoriesJSON) : [];
        
        const storyIndex = existingStories.findIndex(s => s.id === storyId);
        if (storyIndex === -1) {
            throw new Error('Story not found');
        }

        // Add new chapter to the story
        existingStories[storyIndex].chapters.push(chapter);
        
        // Save updated stories array
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existingStories));
        
        return existingStories[storyIndex];
    } catch (error) {
        console.error('Error saving chapter:', error);
        throw error;
    }
}

export const getStories = async (): Promise<Story[]> => {
    //HACK: 
    //AsyncStorage.clear();
    try {
        const storiesJSON = await AsyncStorage.getItem(STORAGE_KEY);
        return storiesJSON ? JSON.parse(storiesJSON) : [];
    } catch (error) {
        console.error('Error getting stories:', error);
        return [];
    }
}