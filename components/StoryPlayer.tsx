import { Audio } from 'expo-av';
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { TTSService } from '../app/services/ttsService';
import { Chapter } from '../types/story';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WAVEFORM_HEIGHT = 40;
const BAR_WIDTH = 3;
const BAR_SPACING = 2;

const TOTAL_PADDING = 30 + 56 + 30; // container padding + button width + margins
const NUM_BARS = Math.floor((SCREEN_WIDTH - TOTAL_PADDING) / (BAR_WIDTH + BAR_SPACING));

interface StoryPlayerProps {
  chapter: Chapter;
  isEnabled?: boolean;
}

const StoryPlayer: React.FC<StoryPlayerProps> = ({ chapter, isEnabled = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const ttsService = TTSService.getInstance();

  useEffect(() => {
    if (isEnabled && chapter) {
      loadAudio();
    }

    const positionUpdateInterval = setInterval(updatePosition, 100);

    return () => {
      clearInterval(positionUpdateInterval);
      ttsService.cleanup();
    };
  }, [chapter, isEnabled]);

  const loadAudio = async () => {
    setIsLoading(true);
    try {
      await ttsService.loadChapter(chapter);
      const status = await ttsService.getStatus();
      if (status?.isLoaded) {
        setDuration(status.durationMillis || 0);
      }
    } catch (error) {
      console.error('Failed to load audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePosition = async () => {
    const status = await ttsService.getStatus();
    if (status?.isLoaded) {
      setPosition(status.positionMillis || 0);
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

  const handleSeek = async (value: number) => {
    await ttsService.seekTo(value);
    setPosition(value * 1000);
  };

  // Generate random heights for waveform (you could make this more sophisticated)
  const waveformBars = Array.from({ length: NUM_BARS }, () => Math.random() * WAVEFORM_HEIGHT);

  if (!isEnabled || !chapter.audioUrl) return null;

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <>
          <View style={styles.playerRow}>
            <TouchableOpacity 
              onPress={handlePlayPause}
              style={styles.button}
            >
              <Ionicons 
                name={isPlaying ? 'pause' : 'play'} 
                size={36}  // Increased from 24
                color="black" 
              />
            </TouchableOpacity>

            <View style={styles.waveformContainer}>
              {waveformBars.map((height, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.waveformBar,
                    {
                      height,
                      opacity: index / NUM_BARS <= position / duration ? 1 : 0.3,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration / 1000}
            value={position / 1000}
            onSlidingComplete={handleSeek}
            minimumTrackTintColor="#000"
            maximumTrackTintColor="#ddd"
            thumbTintColor="#000"
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      padding: 15,  // Increased padding
      backgroundColor: '#fff',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      overflow: 'hidden',  // This ensures nothing extends beyond the container
    },
    playerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      width: '100%',  // Ensure row takes full width
    },
    button: {
      padding: 10,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,  // Increased spacing
    },
    waveformContainer: {
      flex: 1,
      height: WAVEFORM_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: 5,  // Add padding to prevent bars from touching edge
    },
    waveformBar: {
      width: BAR_WIDTH,
      backgroundColor: '#000',
      marginHorizontal: BAR_SPACING / 4,
      borderRadius: BAR_WIDTH / 2,
    },
    slider: {
      width: '100%',
      height: 40,
    },
  });
  


export default StoryPlayer;