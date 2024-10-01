import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';

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

// Mock data for characters (replace with your actual data)
// const characters: Character[] = [
//   { id: '1', name: 'Princess', image: require('../assets/characters/princess.png') },
//   { id: '2', name: 'Knight', image: require('../assets/characters/knight.png') },
//   // Add more characters...
// ];



const Home: React.FC = () => {
  const [characterName, setCharacterName] = useState('');
  const [selectedAgeRange, setSelectedAgeRange] = useState<AgeRange | null>(null);
  //TODO: hardcoding character for now. Delete this later
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>({ id: '1', name: 'Princess', image: require('../../assets/images/baby_icon.png') });


  const handleContinue = async () => {
    if (!characterName || !selectedAgeRange || !selectedCharacter) {
      alert('Please fill in all fields');
      return;
    }

    try {
      // Call your backend API here
      // const response = await fetch('your-api-endpoint', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ characterName, selectedAgeRange, selectedCharacter }),
      // });
      // const data = await response.json();

      // For now, let's just simulate a successful response
    //   router.push('/story/generate');
    } catch (error) {
      console.error('Error generating story:', error);
      alert('Failed to generate story. Please try again.');
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
      {/* <View style={styles.characterGrid}>
        {characters.map((character) => (
          <TouchableOpacity
            key={character.id}
            style={[
              styles.characterItem,
              selectedCharacter === character.id && styles.selectedCharacter,
            ]}
            onPress={() => setSelectedCharacter(character.id)}
          >
            <Image source={character.image} style={styles.characterImage} />
            <Text style={styles.characterName}>{character.name}</Text>
          </TouchableOpacity>
        ))}
      </View> */}

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
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
  },
  characterItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  selectedCharacter: {
    backgroundColor: '#e0e0e0',
  },
  characterImage: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  characterName: {
    textAlign: 'center',
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