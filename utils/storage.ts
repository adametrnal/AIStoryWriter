import AsyncStorage from '@react-native-async-storage/async-storage';
import { Story } from '../types/story';

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

export const getStories = async (): Promise<Story[]> => {
    try {
        const storiesJSON = await AsyncStorage.getItem(STORAGE_KEY);
        return storiesJSON ? JSON.parse(storiesJSON) : [];
    } catch (error) {
        console.error('Error getting stories:', error);
        return [];
    }
}