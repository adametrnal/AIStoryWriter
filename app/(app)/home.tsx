import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import axios  from 'axios';
import Constants from 'expo-constants';
import { useStory } from '../../context/StoryContext';
import { randomUUID } from 'expo-crypto';
import { saveStory } from '../../utils/storage';
import { Story } from '../../types/story';

//Images for Age Selection
const ageRangeIcons = {
    'Baby': require('../../assets/images/baby_icon.png'),
    'Toddler': require('../../assets/images/toddler.png'),
    'Young Reader': require('../../assets/images/young_reader.png'),
    'Advanced Reader': require('../../assets/images/advanced_reader.png'),
}

// Define types
type AgeRange = 'Baby' | 'Toddler' | 'Young Reader' | 'Advanced Reader';

type Character = { id: string; name: string; image: any };

const characters: Character[] = [
  { id: '1', name: 'Princess', image: require('../../assets/images/princess.png') },
  { id: '2', name: 'Knight', image: require('../../assets/images/knight.png') },
  { id: '3', name: 'Elephant', image: require('../../assets/images/elephant.png') },
  { id: '4', name: 'Robot', image: require('../../assets/images/robot.png') },
  { id: '5', name: 'Pirate', image: require('../../assets/images/pirate.png') },
  { id: '6', name: 'Puppy', image: require('../../assets/images/puppy.png') },
  { id: '7', name: 'Octopus', image: require('../../assets/images/octopus.png') },
  { id: '8', name: 'Wizard', image: require('../../assets/images/wizard.png') },
  // Add more characters...
];

const Home: React.FC = () => {
  const { addStory } = useStory();
  const [characterName, setCharacterName] = useState('');
  const [selectedAgeRange, setSelectedAgeRange] = useState<AgeRange | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleContinue = async () => {
    if (!characterName || !selectedAgeRange || !selectedCharacter) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const requestBody = {
        characterName,
        characterType: selectedCharacter.name,
        ageRange: selectedAgeRange
      };

      const fullURL = `${Constants.expoConfig?.extra?.functionsUrl}generate-story`;

      const response = await axios.post(fullURL, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Constants.expoConfig?.extra?.publicSupabaseAnonKey}`
        }
      });
            
      const { storyName, chapterTitle, content } = await response.data;
              
      const newStory:Story = {
        id: randomUUID(),
        title: storyName,
        characterName: characterName,
        characterType: selectedCharacter.name,
        ageRange: selectedAgeRange,
        chapters: [{
          content: content,
          number: 1,
          title: chapterTitle
        }],
        createdAt: Date.now()
      };
      addStory(newStory);

      await saveStory(newStory);

      router.push({
        pathname: '/story',
        params: { 
            storyId: newStory.id,
            chapterNumber: 1,
            characterName: characterName,
            ageRange: selectedAgeRange,
            character: selectedCharacter.name,
            characterType: selectedCharacter.name,
            title: storyName
        }
      });
       
    } catch (error) {
      console.error('Error generating story:', error);
      alert('Failed to generate story. Please try again.');
    } finally {
      setIsLoading(false);
    }

    
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Your Story</Text>

      <Text style={styles.label}>Character Name</Text>
      <TextInput
        style={styles.input}
        value={characterName}
        onChangeText={setCharacterName}
        placeholder="Enter character name"
        placeholderTextColor="#c0c0c0"
        autoComplete="off"
        keyboardType='default'
        autoCapitalize='words'
      />

      <Text style={styles.label}>Age Range</Text>
      <View style={styles.ageRangeContainer}>
        {[
          { range: 'Baby' },
          { range: 'Toddler' },
          { range: 'Young Reader' },
          { range: 'Advanced Reader' },
        ].map((item) => (
          <TouchableOpacity
            key={item.range}
            style={[
              styles.ageRangeButton,
              selectedAgeRange === item.range && styles.selectedAgeRange,
            ]}
            onPress={() => setSelectedAgeRange(item.range as AgeRange)}
          >
            <Image source={ageRangeIcons[item.range as keyof typeof ageRangeIcons]} style={styles.ageRangeIcon} />
            <Text style={[
                styles.ageRangeText,
                selectedAgeRange === item.range && styles.selectedAgeRangeText
            ]}>{item.range}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Select a Character</Text>
      <View style={styles.characterGrid}>
        {characters.map((character) => (
          <TouchableOpacity
            key={character.id}
            style={[
              styles.characterItem,
              selectedCharacter?.id === character.id && styles.selectedCharacter,
            ]}
            onPress={() => setSelectedCharacter(character)}
          >
            <Image source={character.image} style={styles.characterImage} />
            <Text style={styles.characterName}>{character.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue} disabled={isLoading}>
        <Text style={styles.continueButtonText}>{isLoading ? 'Creating...' : 'Continue'} </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: 'black',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: 'black'
  },
  ageRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 50,
  },
  ageRangeButton: {
    alignItems: 'center',
    padding: 0,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '21%',
    aspectRatio: 1,
    marginBottom: 0,
  },
  selectedAgeRange: {
    backgroundColor: '#e0e0e0',
  },
  ageRangeIcon: {
    width: '100%',
    height: 70,
    // resizeMode: 'contain'
  },
  ageRangeText: {
    textAlign: 'center',
    color: 'black',
    padding: 4,
    verticalAlign: 'middle'
  },
  selectedAgeRangeText: {
    color: 'black'
  },
  characterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  characterItem: {
    width: '21%',
    alignItems: 'center',
    marginBottom: 10,
    padding: 0,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    aspectRatio: 1,
  },
  selectedCharacter: {
    backgroundColor: '#e0e0e0',
  },
  characterImage: {
    width: '100%',
    height: 70,
    marginBottom: 5,
  },
  characterName: {
    textAlign: 'center',
    paddingBottom: 5
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Home;