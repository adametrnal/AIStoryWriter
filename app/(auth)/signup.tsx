import { useState } from 'react';
import { StyleSheet, View, Button,TextInput, TouchableOpacity, Image } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from '@/components/ThemedText';
import { router } from "expo-router";
import { supabase } from '../services/supabase';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

// Initialize WebBrowser for Apple Sign In
WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signUpWithEmail() {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log("authing...")
    if (error) {
      console.log("error", error);
      setError(error.message);
    } else {
      console.log("success, should redirect to home");
      router.push('/home');
    }
    
    setLoading(false);
  }

  async function signUpWithApple() {
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

      if (data) {
        console.log('Redirecting to OAuth provider...');
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
        <ThemedText style={styles.title} type="title">Create Account</ThemedText>
        
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
            title={loading ? "Creating account..." : "Sign Up"}
            onPress={signUpWithEmail}
            disabled={loading}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <ThemedText style={styles.dividerText}>or</ThemedText>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={styles.appleButton}
            onPress={signUpWithApple}
            disabled={loading}
          >
            {/* <Image 
              source={require('@/assets/apple-logo.png')} 
              style={styles.appleIcon}
            /> */}
            <ThemedText style={styles.appleButtonText}>
              Continue with Apple
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/login')}
            style={styles.loginLink}
          >
            <ThemedText style={styles.loginLinkText}>
              Already have an account? Log in
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
  button: {
    marginBottom: 20,
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
    padding: 15,
    borderRadius: 10,
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
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
});