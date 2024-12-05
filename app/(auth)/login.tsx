import { useState } from 'react';
import { StyleSheet, View, TextInput, Button } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from '@/components/ThemedText';
import { router } from "expo-router";
import supabase from '../../app/services/supabase';
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { TouchableOpacity, Image } from 'react-native'

// Initialize WebBrowser
WebBrowser.maybeCompleteAuthSession()

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithEmail() {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Starting sign in attempt...");
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log("Sign in response received", error ? "with error" : "successfully");
      
      if (error) {
        setError(error.message);
      } else {
        router.push('/home');
      }
    } catch (e) {
      console.error("Sign in error:", e);
      setError(e instanceof Error ? e.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function signInWithApple() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: makeRedirectUri({
            path: '/(auth)/callback'
          }),
          queryParams: {
            prompt: 'login'
          }
        }
      });

      if (error) throw error;

      // The OAuth process will handle the redirect automatically
      if (data) {
        console.log('Redirecting to Apple sign in...');
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An error occurred during sign in');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaProvider>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title} type="title">Log In</ThemedText>
        
        <View style={styles.formContainer}>
        <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#666"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#666"
          />
          {error && <ThemedText style={styles.error}>{error}</ThemedText>}
          
          <Button
            title={loading ? "Logging in..." : "Log In"}
            onPress={signInWithEmail}
            disabled={loading}
          />
          
          <TouchableOpacity 
            onPress={() => router.push('/signup')}
            style={styles.signupLink}
          >
            <ThemedText style={styles.signupLinkText}>
              Don't have an account? Sign up
            </ThemedText>
          </TouchableOpacity>
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
    justifyContent: 'flex-start',
    padding: 20,
    backgroundColor: 'transparent'
  },
  title: {
    marginTop: 100,
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
    padding: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dividerText: {
    marginHorizontal: 10,
    color: 'rgba(255,255,255,0.6)',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
  },
  appleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: '#fff',
  },
  appleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  error: {
    color: '#ff4444',
    marginBottom: 15,
    textAlign: 'center',
  },
  signupLink: {
    marginTop: 15,
    alignItems: 'center',
  },
  signupLinkText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
})