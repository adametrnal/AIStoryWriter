import 'dotenv/config';

export default {
  expo: {
    name: "AI Storyteller",
    slug: "ai-storyteller",
    version: "0.1.0",
    icon: "./assets/icon.png",
    ios: {
      bundleIdentifier: "com.brillshire.ai-storyteller",
    },
    scheme: "ai-storyteller",
    extra: {
      "eas": {
        "projectId":"a25695ed-3b67-4367-9da2-c8ef27bf91c0"
      },
      publicSupabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL, 
      functionsUrl: process.env.EXPO_PUBLIC_FUNCTIONS_URL
    },
  },
}


