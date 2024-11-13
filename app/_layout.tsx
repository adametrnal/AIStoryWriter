import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Drawer } from 'expo-router/drawer';
import { CustomDrawerContent } from '../components/CustomDrawerContext';
import { AuthProvider } from './providers/AuthProvider';
import { useAuth } from './services/authService';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
 

import { useColorScheme } from '@/hooks/useColorScheme';
import { StoryProvider } from '../context/StoryContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function DrawerNavigator() {
  const { session } = useAuth();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: !!session, // Only show header when logged in
        drawerStyle: {
          backgroundColor: '#fff',
          width: 280,
        },
      }}
    >
      <Drawer.Screen
        name="(app)/home"
        options={{
          title: "Create New Story",
        }}
      />
      <Drawer.Screen
        name="(app)/story"
        options={({ route }: { route?: { params?: { title?: string; characterName?: string; chapterNumber?: number } } }) => ({
          title: route?.params?.title
            ? `${route.params.title}`
            : route?.params?.characterName 
            ? `${route.params.characterName}'s Story - Chapter ${route.params.chapterNumber}`
            : 'Story',
        })}
      />
      <Drawer.Screen
        name="(app)/settings"
        options={{
          title: "Settings",
        }}
      />
      <Drawer.Screen
        name="(auth)/signup"
        options={{
          title: "Sign Up",
          headerShown: false, // Always hide header for auth screens
          drawerItemStyle: { display: 'none' }
        }}
      />
      <Drawer.Screen
        name="(auth)/login"
        options={{
          title: "Login",
          headerShown: false, // Always hide header for auth screens
          drawerItemStyle: { display: 'none' }
        }}
      />
    </Drawer>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <StoryProvider>
          <DrawerNavigator />
        </StoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
