import React, { useState, useRef,useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';
import { useStory } from '../../context/StoryContext';
import { saveChapter } from '../../utils/storage';

const StoryResult: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const params = useLocalSearchParams<{ 
    storyId: string, 
    chapterNumber: string, 
    characterName: string, 
    characterType: string, 
    ageRange: string 
  }>();

  const { stories, addChapterToStory } = useStory();
  const [isLoading, setIsLoading] = useState(false);

  const currentStory = stories.find(story => story.id === params.storyId);
  const currentChapterNumber = parseInt(params.chapterNumber);
  const currentChapter = currentStory?.chapters.find(
    ch => ch.number === currentChapterNumber
  );

  const isLastChapter = currentStory
    ? currentChapterNumber === currentStory.chapters.length
    : true;

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentChapter]);

  const handleNextChapterAction = async () => {
    if (isLastChapter) {
      await generateNextChapter();
    } else {
      // Navigate to next existing chapter
      router.push({
        pathname: '/story',
        params: {
          ...params,
          chapterNumber: currentChapterNumber + 1
        }
      });
    }
  };

  const generateNextChapter = async () => {
    if (!currentStory) return;

    setIsLoading(true);
    const nextChapterNumber = currentChapterNumber+ 1;

    try {
      const requestBody = {
        characterName: params.characterName,
        characterType: params.characterType,
        ageRange: params.ageRange,
        previousChapters: currentStory.chapters.map(ch => ch.content),
        nextChapterNumber,
        storyId: params.storyId
      };

      const fullURL = `${Constants.expoConfig?.extra?.functionsUrl}generate-chapter`;

      const response = await axios.post(fullURL, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Constants.expoConfig?.extra?.publicSupabaseAnonKey}`
        }
      });
            
      const { content, chapterTitle, illustrationUrl } = await response.data;

      const newChapter = {
        content: content,
        number: nextChapterNumber,
        title: chapterTitle,
        illustrationUrl: illustrationUrl
      };
      addChapterToStory(params.storyId, newChapter);
      await saveChapter(params.storyId, newChapter);

      router.push({
        pathname: '/story',
        params: {
          ...params,
          chapterNumber: nextChapterNumber
        }
      });
    } catch (error) {
      console.error('Error generating next chapter:', error);
      alert('Failed to generate the next chapter. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentStory || !currentChapter) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Story not found</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} ref={scrollViewRef}>
      <Image source={{ uri: currentChapter?.illustrationUrl }} style={styles.illustration} />
      <Text style={styles.storyText}>{currentChapter?.content}</Text>
      <TouchableOpacity 
        style={styles.generateButton} 
        onPress={handleNextChapterAction}
        disabled={isLoading}
      >
        <Text style={styles.generateButtonText}>
          {isLoading ? 
          'Writing...' 
          : isLastChapter 
            ? 'Write Next Chapter'
            : 'Read Next Chapter'}
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
    marginBottom: 100
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  illustration: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: 20,
    borderRadius: 8
  }
});

export default StoryResult;