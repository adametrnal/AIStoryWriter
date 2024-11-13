import React, { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const STORAGE_KEY = 'settings';

// Types
export interface SettingsState {
  audioEnabled: boolean;
  highlightingEnabled: boolean;
}

export const defaultSettings: SettingsState = {
  audioEnabled: true,
  highlightingEnabled: true,
} as const;

// Storage utility functions
const storage = {
  async get(): Promise<SettingsState | null> {
    try {
      const savedSettings = await AsyncStorage.getItem(STORAGE_KEY);
      return savedSettings ? JSON.parse(savedSettings) : null;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return null;
    }
  },

  async set(settings: SettingsState): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }
};

// Hook
export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    const savedSettings = await storage.get();
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<SettingsState>) => {
    const updatedSettings = {
      ...settings,
      ...newSettings
    };
    
    await storage.set(updatedSettings);
    setSettings(updatedSettings);
  }, [settings]);

  return {
    settings,
    updateSettings,
    loadSettings,
  };
}

// Optional: Export individual setting getters for direct AsyncStorage access
export async function getAudioEnabled(): Promise<boolean> {
  const settings = await storage.get();
  return settings?.audioEnabled ?? defaultSettings.audioEnabled;
}

export async function getHighlightingEnabled(): Promise<boolean> {
  const settings = await storage.get();
  return settings?.highlightingEnabled ?? defaultSettings.highlightingEnabled;
}