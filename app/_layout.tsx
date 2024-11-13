import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Drawer } from 'expo-router/drawer';
import { CustomDrawerContent } from '../components/CustomDrawerContext';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { StoryProvider } from '../context/StoryContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

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
      <StoryProvider>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: true,
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
          options={({ route }: { route?: { params?: { title?: string; characterName?: string; chapterNumber?: number } } }) => {
            return {
              title: route?.params?.title
                ? `${route.params.title}`
                : route?.params?.characterName 
              ? `${route.params.characterName}'s Story - Chapter ${route.params.chapterNumber}`
              : 'Story',
            };
          }}
        />
        <Drawer.Screen
          name="(app)/settings"
          options={{
            title: "Settings",
          }}
        />
      </Drawer>
      </StoryProvider>
    </ThemeProvider>
  );
}
