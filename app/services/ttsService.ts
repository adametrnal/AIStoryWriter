import { Audio, AVPlaybackStatus } from 'expo-av';
import { Chapter } from '../../types/story';
import AsyncStorage from '@react-native-async-storage/async-storage';


export class TTSService {
  private static instance: TTSService;
  private audio: Audio.Sound | null = null;
  private currentChapter: Chapter | null = null;
  private isLoaded: boolean = false;

  static getInstance() {
    if (!this.instance) {
      this.instance = new TTSService();
    }
    return this.instance;
  }
  
  constructor() {
    // Initialize Audio session
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }

  async loadChapter(chapter: Chapter) {
    try {
      // Unload previous audio if exists
      console.log('Chapter:', chapter);
      if (this.audio) {
        await this.audio.unloadAsync();
        this.isLoaded = false;
      }

      if (!chapter.audio_url) {
        throw new Error('No audio URL found');
      }

      console.log('Attempting to load audio from URL:', chapter.audio_url);

      // Create new audio instance
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: chapter.audio_url },
        { shouldPlay: false },
        this.onPlaybackStatusUpdate
      );
      
      this.audio = sound;
      this.isLoaded = true;

      return true;
    } catch (error) {
      console.error('Failed to load audio:', error);
      return false;
    }
  }

  private onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      // Handle status updates (optional)
      // You can emit events here for UI updates
      if (status.didJustFinish) {
        this.stop();
      }
    }
  };

  async play() {
    if (!this.audio || !this.isLoaded) return;
    try {
      await this.audio.playAsync();
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  }

  async pause() {
    if (!this.audio || !this.isLoaded) return;
    try {
      await this.audio.pauseAsync();
    } catch (error) {
      console.error('Failed to pause audio:', error);
    }
  }

  async stop() {
    if (!this.audio || !this.isLoaded) return;
    try {
      await this.audio.stopAsync();
      await this.audio.setPositionAsync(0);
    } catch (error) {
      console.error('Failed to stop audio:', error);
    }
  }

  async seekTo(position: number) {
    if (!this.audio || !this.isLoaded) return;
    try {
      await this.audio.setPositionAsync(position * 1000); // Convert to milliseconds
    } catch (error) {
      console.error('Failed to seek audio:', error);
    }
  }

  async getStatus(): Promise<AVPlaybackStatus | null> {
    if (!this.audio || !this.isLoaded) return null;
    try {
      return await this.audio.getStatusAsync();
    } catch (error) {
      console.error('Failed to get audio status:', error);
      return null;
    }
  }

  async cleanup() {
    if (this.audio) {
      try {
        await this.audio.unloadAsync();
        this.isLoaded = false;
      } catch (error) {
        console.error('Failed to cleanup audio:', error);
      }
    }
  }
}