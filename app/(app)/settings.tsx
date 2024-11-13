import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useSettings } from '../../components/Settings';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();

  return (
    <View style={styles.container}>
      
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Audio Playback</Text>
        <Switch
          value={settings.audioEnabled}
          onValueChange={(value) => updateSettings({ audioEnabled: value })}
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Word Highlighting</Text>
        <Switch
          value={settings.highlightingEnabled}
          onValueChange={(value) => updateSettings({ highlightingEnabled: value })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    color: '#666',
  },
});