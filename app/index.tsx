import { ImageBackground, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@react-navigation/native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from '@/components/ThemedText';
import { Link } from "expo-router";

export default function InitScreen() {
  return (
    <SafeAreaProvider>
      <ImageBackground
        source={require('../assets/images/splash.png')}
        style={styles.backgroundImage}
      >
        <ThemedView style={styles.container}>
          {/* <ThemedText style={styles.title} type="title">Welcome to AI Storyteller!</ThemedText> */}
          <View style={styles.buttonContainer}>
            <Link style={styles.titleButton} href="/signup">Sign Up</Link>
            <Link style={styles.titleButton} href="/login">Log In</Link>
          </View>
        </ThemedView>
      </ImageBackground>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',  
    padding: 20,
    backgroundColor: 'transparent'
  },
  title: {
    marginTop: 100,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 50,
  },
  titleButton: {
    marginBottom: 20,
    fontSize:30,
    borderColor: 'white',
    borderStyle: 'solid',
    borderWidth: 1,
    padding: 14,
    color: "#000000",
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)"

  },

});
