import { ImageBackground, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@react-navigation/native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from '@/components/ThemedText';
import { Link } from "expo-router";

export default function InitScreen() {
  return (
    <SafeAreaProvider>
        <ThemedView style={styles.container}>
          <ThemedText style={styles.title} type="title">Sign Up!</ThemedText>
          {/* TODO These are just placeholders. Remove when auth is implemented */}
          <View style={styles.buttonContainer}>
            <Link style={styles.titleButton} href="/home">Complete Auth</Link>
          </View>
        </ThemedView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',  
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
