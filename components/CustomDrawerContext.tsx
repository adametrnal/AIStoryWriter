import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useStory } from '../context/StoryContext';
import { router, useGlobalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../app/services/authService';


export function CustomDrawerContent(props: any) {
  const { stories } = useStory();
  const [expandedStories, setExpandedStories] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useGlobalSearchParams();
  const currentStoryId = params.storyId as string;
  const currentChapter = params.chapterNumber as string;

  React.useEffect(() => {
    if (currentStoryId) {
      setExpandedStories(prev => ({
        ...prev,
        [currentStoryId]: true
      }));
    }
  }, [currentStoryId]);

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
        characterType: story.characterType,
        title: story.title
      }
    });
  };

  const navigateToHome = () => {
    router.push('/home');
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.signOut();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred while signing out');
    } finally {
      setLoading(false);
    }
  };

  const sortedStories = stories
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <DrawerContentScrollView {...props}>
      <TouchableOpacity 
        style={styles.createNewButton}
        onPress={navigateToHome}
      >
        <Text style={styles.createNewText}>Create New Story</Text>
      </TouchableOpacity>

      {sortedStories.map((story) => (
        <View key={story.id} style={styles.storyContainer}>
          <TouchableOpacity 
            style={styles.storyHeader}
            onPress={() => toggleStoryExpanded(story.id)}
          >
            <Image 
              source={{ uri: story.chapters[0]?.illustrationUrl }} 
              style={styles.storyIcon} 
              resizeMode="cover"
            />
            <Text style={styles.storyTitle}>{story.title || `${story.characterName}'s Story`}</Text>
            <Ionicons 
              name={expandedStories[story.id] ? 'chevron-down' : 'chevron-forward'} 
              size={20} 
              color="#666"
            />
          </TouchableOpacity>
          
          {expandedStories[story.id] && story.chapters.map((chapter) => (
            <TouchableOpacity
              key={chapter.number}
              style={[
                styles.chapterItem,
                currentStoryId === story.id &&
                Number(currentChapter) === chapter.number &&
                styles.activeChapter
              ]}
              onPress={() => navigateToChapter(story, chapter.number)}
            >
              <Text style={[
                styles.chapterText,
                currentStoryId === story.id &&
                Number(currentChapter) === chapter.number &&
                styles.activeChapterText
              ]}
            >{`${chapter.number}. ${chapter.title}` || `Chapter ${chapter.number}`}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      <TouchableOpacity 
        style={styles.settingsLink}
        onPress={() => router.push('/settings')}
      >
        <Ionicons name="settings-outline" size={24} color="#666" />
        <Text style={styles.settingsText}>Settings</Text>
      </TouchableOpacity>
      <View style={styles.signOutContainer}>
        {error && <Text style={styles.error}>{error}</Text>}
        
        <TouchableOpacity 
          onPress={handleSignOut}
          style={styles.signOutButton}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ff4444" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={24}  />
              <Text style={styles.signOutText}>Sign Out</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  storyIcon: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 10
  },
  chapterItem: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: '#f5f5f5',
  },
  chapterText: {
    color: '#666',
  },
  activeChapter: {
    backgroundColor: '#007AFF22',
  },
  activeChapterText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  settingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingsText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  signOutContainer: {
    padding: 16,
    // borderTopWidth: 1,
    borderBottomWidth: 1,
    // borderTopColor: 'rgba(0,0,0,0.1)',
    borderBottomColor: 'rgba(0,0,0,0.1)',
    
  },
  signOutButton: {
    padding: 1,
    flexDirection: 'row',
    alignItems: 'center', 
    gap: 10
  },
  signOutText: {
    fontSize: 16,
    color: '#666',
  },
  error: {
    color: '#ff4444',
    marginBottom: 10,
    textAlign: 'center',
  },
});