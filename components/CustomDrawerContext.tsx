import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useStory } from '../context/StoryContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export function CustomDrawerContent(props: any) {
  const { stories } = useStory();
  const [expandedStories, setExpandedStories] = useState<Record<string, boolean>>({});

  const toggleStoryExpanded = (storyId: string) => {
    setExpandedStories(prev => ({
      ...prev,
      [storyId]: !prev[storyId]
    }));
  };

  const navigateToChapter = (story: any, chapterNumber: number) => {
    router.push({
      pathname: '/story',
      params: {
        storyId: story.id,
        chapterNumber,
        characterName: story.characterName,
        ageRange: story.ageRange,
        characterType: story.characterType
      }
    });
  };

  const navigateToHome = () => {
    router.push('/home');
  };

  return (
    <DrawerContentScrollView {...props}>
      <TouchableOpacity 
        style={styles.createNewButton}
        onPress={navigateToHome}
      >
        <Text style={styles.createNewText}>Create New Story</Text>
      </TouchableOpacity>

      {stories.map((story) => (
        <View key={story.id} style={styles.storyContainer}>
          <TouchableOpacity 
            style={styles.storyHeader}
            onPress={() => toggleStoryExpanded(story.id)}
          >
            <Text style={styles.storyTitle}>{story.characterName}'s Story</Text>
            <Ionicons 
              name={expandedStories[story.id] ? 'chevron-down' : 'chevron-forward'} 
              size={20} 
              color="#666"
            />
          </TouchableOpacity>
          
          {expandedStories[story.id] && story.chapters.map((chapter) => (
            <TouchableOpacity
              key={chapter.number}
              style={styles.chapterItem}
              onPress={() => navigateToChapter(story, chapter.number)}
            >
              <Text style={styles.chapterText}>Chapter {chapter.number}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  createNewButton: {
    padding: 15,
    backgroundColor: '#007AFF',
    margin: 10,
    borderRadius: 5,
  },
  createNewText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  storyContainer: {
    marginVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  storyTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  chapterItem: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: '#f5f5f5',
  },
  chapterText: {
    color: '#666',
  },
});