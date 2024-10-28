import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';

const StoryResult: React.FC = () => {
  const { story: initialStory, characterName, characterType, ageRange } = useLocalSearchParams<{ 
    story: string, 
    characterName: string, 
    characterType: string, 
    ageRange: string 
  }>();

  const [story, setStory] = useState(initialStory);
  const [chapterCount, setChapterCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const openaiApiKey = Constants.expoConfig?.extra?.openaiApiKey;

  const generateNextChapter = async () => {
    setIsLoading(true);
    const nextChapterNumber = chapterCount + 1;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that generates stories for children. 
            Your job is to generate the next chapter of an ongoing story. 
            Please be creative and engaging, and follow these guidelines for ${ageRange} readers.`,
          },
          {
            role: 'user',
            content: `The character name is ${characterName}, the type of character is ${characterType}. 
            This is the story so far: ${story}
            Please generate Chapter ${nextChapterNumber}, continuing the story.`,
          },
        ]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        }
      });

      const newChapter = response.data.choices[0].message.content;
      setStory(prevStory => `${prevStory}\n\nChapter ${nextChapterNumber}:\n${newChapter}`);
      setChapterCount(nextChapterNumber);
    } catch (error) {
      console.error('Error generating next chapter:', error);
      alert('Failed to generate the next chapter. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Generated Story</Text>
      <Text style={styles.storyText}>{story}</Text>
      <TouchableOpacity 
        style={styles.generateButton} 
        onPress={generateNextChapter}
        disabled={isLoading}
      >
        <Text style={styles.generateButtonText}>
          {isLoading ? 'Generating...' : 'Generate Next Chapter'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  storyText: {
    fontSize: 16,
    lineHeight: 24,
    color: 'black',
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StoryResult;