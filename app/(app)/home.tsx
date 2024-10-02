import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import axios  from 'axios';
import Constants from 'expo-constants';

//Images for Age Selection
const ageRangeIcons = {
    'Baby': require('../../assets/images/baby_icon.png'),
    'Toddler': require('../../assets/images/toddler.png'),
    'Young Reader': require('../../assets/images/young_reader.png'),
    'Advanced Reader': require('../../assets/images/advanced_reader.png'),
}

// Define types
type AgeRange = 'Baby' | 'Toddler' | 'Young Reader' | 'Advanced Reader';
const ageRangeMapping: Record<AgeRange, string> = {
    'Baby': 'Focus on simple, repetitive language with familiar objects like animals, colors, and basic emotions (happy, sad). Keep the tone soothing and the story no longer than a few sentences per chapter.',
    'Toddler': 'Use simple language but introduce slightly more complex ideas like curiosity, friendship, and problem-solving. Use familiar settings and playful characters. Chapters should be short with some gentle excitement or discoveries.',
    'Young Reader': 'Introduce slightly more developed plotlines and challenges. Use adventure, exploration, and basic conflicts with resolutions. The story can include a few paragraphs per chapter and involve character development and teamwork.',
    'Advanced Reader': 'Focus on more complex plots with emotional depth, longer chapters, and character growth. Include adventure, learning, problem-solving, and more detailed world-building. Suitable for readers beginning to enjoy longer, more nuanced stories.',
}
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
  const [characterName, setCharacterName] = useState('');
  const [selectedAgeRange, setSelectedAgeRange] = useState<AgeRange | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const openaiApiKey = Constants.expoConfig?.extra?.openaiApiKey;


  const handleContinue = async () => {
    if (!characterName || !selectedAgeRange || !selectedCharacter) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    const userPrompt = `The character name is a ${characterName}, the type of character is a ${selectedCharacter.name}.`;
    console.log('The user prompt is: ', userPrompt);
    //TODO: move the actual openAI calls to the server.
    try {
       const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that generates stories for children.
            Your job is to generate a story for the user, one chapter at a time. The user will click a button to generate the next chapter. 
            Please be creative and engaging, and follow these guidelines: ${ageRangeMapping[selectedAgeRange]}.`,
          },
          {
            role: 'user',
            content: `${userPrompt}`,
          },
        ]}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`
            }
        }
       )

       const generatedStory = response.data.choices[0].message.content;
       console.log(generatedStory);     
       router.push({
        pathname: '/story',
        params: { story: generatedStory }
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