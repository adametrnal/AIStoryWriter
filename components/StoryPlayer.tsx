import { Audio } from 'expo-av';
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { TTSService } from '../app/services/ttsService';
import { Chapter } from '../types/story';
import { Ionicons } from '@expo/vector-icons'; 

interface StoryPlayerProps {
  chapter: Chapter;
  isEnabled?: boolean;
}

const StoryPlayer: React.FC<StoryPlayerProps> = ({ chapter, isEnabled = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ttsService = TTSService.getInstance();

  useEffect(() => {
    // Load audio when chapter changes
    if (isEnabled && chapter) {
      loadAudio();
    }

    // Cleanup when component unmounts
    return () => {
      ttsService.cleanup();
    };
  }, [chapter, isEnabled]);

  const loadAudio = async () => {
    setIsLoading(true);
    try {
      await ttsService.loadChapter(chapter);
    } catch (error) {
      console.error('Failed to load audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      await ttsService.pause();
      setIsPlaying(false);
    } else {
      await ttsService.play();
      setIsPlaying(true);
    }
  };

  if (!isEnabled || !chapter.audioUrl) return null;

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <TouchableOpacity 
          onPress={handlePlayPause}
          style={styles.button}
        >
          <Ionicons 
            name={isPlaying ? 'pause' : 'play'} 
            size={24} 
            color="black" 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    padding: 10,
  }
});

export default StoryPlayer;