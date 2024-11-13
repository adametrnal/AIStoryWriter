import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SettingsState {
  audioEnabled: boolean;
  highlightingEnabled: boolean;
}

export const defaultSettings: SettingsState = {
  audioEnabled: true,
  highlightingEnabled: true,
};

export function useSettings() {
    // Start with null to force a load from storage
    const [settings, setSettings] = React.useState<SettingsState | null>(null);
  
    // Load settings whenever settings is null
    React.useEffect(() => {
        console.log('5. settings changed in useSettings hook:', settings);

      if (settings === null) {
        loadSettings();
      }
    }, [settings]);
  
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('settings');
        console.log('Settings.tsx Loading settings from storage:', savedSettings);
  
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          console.log('Settings.tsx Setting state to:', parsed);
          setSettings(parsed);
        } else {
          console.log('Settings.tsx No saved settings, using defaults');
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setSettings(defaultSettings);
      }
    };
  
    const updateSettings = async (newSettings: Partial<SettingsState>) => {
        try {
          const updatedSettings = { ...defaultSettings, ...settings, ...newSettings };
          console.log('1. updateSettings called with:', newSettings);
          console.log('2. creating updatedSettings:', updatedSettings);
          await AsyncStorage.setItem('settings', JSON.stringify(updatedSettings));
          console.log('3. saved to AsyncStorage');
          setSettings(updatedSettings);
          console.log('4. setSettings called with:', updatedSettings);
        } catch (error) {
          console.error('Error saving settings:', error);
        }
      };
  
    // Return default settings if settings is null
    return { 
      settings: settings || defaultSettings, 
      updateSettings,
      loadSettings

    };
  }

