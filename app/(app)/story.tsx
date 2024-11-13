import React, { useState, useRef,useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';
import { useStory } from '../../context/StoryContext';
import { saveChapter } from '../../utils/storage';
import StoryPlayer from '../../components/StoryPlayer';
import { useSettings } from '../../components/Settings';
import AsyncStorage from '@react-native-async-storage/async-storage';


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
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [showAudio, setShowAudio] = useState(true);
  const [showHighlighting, setShowHighlighting] = useState(true);
  const { settings } = useSettings();
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

  useFocusEffect(
    React.useCallback(() => {
      const checkSettings = async () => {
        try {
          //Todo: use useSettings hook. I tried using the Settings hook but it was always getting stale values so I had to use AsyncStorage directly.
          const savedSettings = await AsyncStorage.getItem('settings');
          if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            console.log('Fresh settings loaded:', settings);
            setShowAudio(settings.audioEnabled);
            setShowHighlighting(settings.highlightingEnabled);
          }
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      };

      checkSettings();
    }, []) 
  );

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
        characterDescription: currentStory?.characterDescription,
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
            
      const { content, chapterTitle, illustrationUrl, audioUrl, timestampsUrl, characterDescription } = await response.data;

      const newChapter = {
        content: content,
        number: nextChapterNumber,
        title: chapterTitle,
        illustrationUrl: illustrationUrl,
        audioUrl: audioUrl,
        timestampsUrl: timestampsUrl,
      };
      console.log('New Chapter:', newChapter);
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

  const renderStoryText = () => {
    console.log('7. settings during Story render:', settings);
    if (!currentChapter?.content) return null;
    
    // Split on newlines first, then handle words
    const paragraphs = currentChapter.content.split('\n');
    let wordIndex = 0;
    
    return (
      <Text style={styles.storyText}>
        {paragraphs.map((paragraph, pIndex) => {
          // Split paragraph into words and filter empty strings
          const words = paragraph
            .split(' ')
            .filter(word => word.length > 0);
          
          // Create an array of word elements for this paragraph
          console.log('showHighlighting', showHighlighting);
          const wordElements = words.map((word, wIndex) => {
            const isHighlighted = wordIndex === currentWordIndex;
            wordIndex++; // Increment for next word
            
            return (
              <Text
                key={`${pIndex}-${wIndex}`}
                style={[
                  showHighlighting && isHighlighted && styles.highlightedWord
                ]}
              >
                {word}{' '}
              </Text>
            );
          });
          
          // Add paragraph break if not the last paragraph
          return (
            <Text key={`p-${pIndex}`}>
              {wordElements}
              {pIndex < paragraphs.length - 1 && '\n'}
            </Text>
          );
        })}
      </Text>
    );
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
      {currentChapter && showAudio && (
        <StoryPlayer 
          chapter={currentChapter} 
          onWordIndexChange={setCurrentWordIndex}
        />
      )}
      {renderStoryText()}
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
  },
  highlightedWord: {
    backgroundColor: '#ffeb3b',
    borderRadius: 4,
    padding: 2,
  },
});

export default StoryResult;