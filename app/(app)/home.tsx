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
    'Baby': require('../../assets/images/age_range/baby_icon.png'),
    'Toddler': require('../../assets/images/age_range/toddler.png'),
    'Young Reader': require('../../assets/images/age_range/young_reader.png'),
    'Advanced Reader': require('../../assets/images/age_range/advanced_reader.png'),
}

// Define types
type AgeRange = 'Baby' | 'Toddler' | 'Young Reader' | 'Advanced Reader';

type Character = { id: string; name: string; image: any };

const characters: Character[] = [
  { id: '1', name: 'Princess', image: require('../../assets/images/characters/princess.png') },
  { id: '2', name: 'Knight', image: require('../../assets/images/characters/knight.png') },
  { id: '3', name: 'Elephant', image: require('../../assets/images/characters/elephant.png') },
  { id: '4', name: 'Robot', image: require('../../assets/images/characters/robot.png') },
  { id: '5', name: 'Pirate', image: require('../../assets/images/characters/pirate.png') },
  { id: '6', name: 'Puppy', image: require('../../assets/images/characters/puppy.png') },
  { id: '7', name: 'Octopus', image: require('../../assets/images/characters/octopus.png') },
  { id: '8', name: 'Wizard', image: require('../../assets/images/characters/wizard.png') },
  // Add more characters...
];

type Descriptor = { id: string; name: string; image: any };

const descriptors: Descriptor[] = [
  { id: '1', name: 'Miniature', image: require('../../assets/images/descriptors/miniature.png') },
  { id: '2', name: 'Giant', image: require('../../assets/images/descriptors/giant.png') },
  { id: '3', name: 'Turbo', image: require('../../assets/images/descriptors/turbo.png') },
  { id: '4', name: 'Lazy', image: require('../../assets/images/descriptors/lazy.png') },
]

type Genre = { id: string; name: string; image: any };

const genres: Genre[] = [
  { id: '1', name: 'Fantasy', image: require('../../assets/images/genres/fantasy.png') },
  { id: '2', name: 'Adventure', image: require('../../assets/images/genres/adventure.png') },
  { id: '3', name: 'Mystery', image: require('../../assets/images/genres/mystery.png') },
  { id: '4', name: 'Sci-Fi', image: require('../../assets/images/genres/sci-fi.png') },
  { id: '5', name: 'Thriller', image: require('../../assets/images/genres/thriller.png') },
  { id: '6', name: 'Comedy', image: require('../../assets/images/genres/comedy.png') },
  { id: '7', name: 'Non-fiction', image: require('../../assets/images/genres/non-fiction.png') },
  { id: '8', name: 'Fairytale', image: require('../../assets/images/genres/fairytale.png') },
  // Add more genres...
];

const Home: React.FC = () => {
  const { addStory } = useStory();
  const [characterName, setCharacterName] = useState('');
  const [selectedAgeRange, setSelectedAgeRange] = useState<AgeRange | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null); 
  const [selectedDescriptor, setSelectedDescriptor] = useState<Descriptor | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleContinue = async () => {
    if (!characterName || !selectedAgeRange || !selectedCharacter || !selectedGenre || !selectedDescriptor) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const storyId = randomUUID();

      const requestBody = {
        storyId,
        characterName,
        characterType: selectedCharacter.name,
        ageRange: selectedAgeRange,
        genre: selectedGenre.name,
        descriptor: selectedDescriptor.name
      };

      const fullURL = `${Constants.expoConfig?.extra?.functionsUrl}generate-story`;

      const response = await axios.post(fullURL, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Constants.expoConfig?.extra?.publicSupabaseAnonKey}`
        }
      });
            
      const { storyName, chapterTitle, content, illustrationUrl, characterDescription, audioUrl, timestampsUrl } = await response.data;
              
      const newStory:Story = {
        id: storyId,
        title: storyName,
        characterName: characterName,
        characterType: selectedCharacter.name,
        ageRange: selectedAgeRange,
        genre: selectedGenre.name,
        descriptor: selectedDescriptor.name,
        characterDescription: characterDescription,
        chapters: [{
          content: content,
          number: 1,
          title: chapterTitle,
          illustrationUrl: illustrationUrl,
          audioUrl: audioUrl,
          timestampsUrl: timestampsUrl,
        }],
        createdAt: Date.now()
      };
      console.log('New Story:', newStory);
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
            genre: selectedGenre.name,
            descriptor: selectedDescriptor.name,
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

      <Text style={styles.label}>Describe your character</Text>
      <View style={styles.characterGrid}>
        {descriptors.map((descriptor) => (
          <TouchableOpacity
            key={descriptor.id}
            style={[
              styles.descriptorItem,
              selectedDescriptor?.id === descriptor.id && styles.selectedDescriptor,
            ]}
            onPress={() => setSelectedDescriptor(descriptor)}
          >
            <Image source={descriptor.image} style={styles.descriptorImage} />
            <Text style={styles.descriptorName}>{descriptor.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Select a Genre</Text>
      <View style={styles.characterGrid}>
        {genres.map((genre) => (
          <TouchableOpacity
            key={genre.id}
            style={[
              styles.genreItem,
              selectedGenre?.id === genre.id && styles.selectedGenre,
            ]}
            onPress={() => setSelectedGenre(genre)}
          >
            <Image source={genre.image} style={styles.genreImage} />
            <Text style={styles.genreName}>{genre.name}</Text>
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
    marginBottom: 10,
    color: 'black',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 35,
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
    marginBottom: 40,
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
  descriptorItem: {
    width: '21%',
    alignItems: 'center',
    marginBottom: 10,
    padding: 0,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    aspectRatio: 1,
  },
  selectedDescriptor: {
    backgroundColor: '#e0e0e0',
  },
  descriptorImage: {
    width: '100%',
    height: 70,
    marginBottom: 5,
  },
  descriptorName: {
    textAlign: 'center',
    paddingBottom: 5
  },
  genreItem: {
    width: '21%',
    alignItems: 'center',
    marginBottom: 10,
    padding: 0,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    aspectRatio: 1,
  },
  selectedGenre: {
    backgroundColor: '#e0e0e0',
  },
  genreImage: {
    width: '100%',
    height: 70,
    marginBottom: 5,
  },
  genreName: {
    textAlign: 'center',
    paddingBottom: 5,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 400,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Home;