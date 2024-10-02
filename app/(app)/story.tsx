import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const StoryResult: React.FC = () => {
  const { story } = useLocalSearchParams<{ story: string }>();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Generated Story</Text>
      <Text style={styles.storyText}>{story}</Text>
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
  },
});

export default StoryResult;