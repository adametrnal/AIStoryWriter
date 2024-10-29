import 'dotenv/config';


const isProduction = process.env.NODE_ENV === 'production';

export default {
  expo: {
    name: "AI Storyteller",
    slug: "ai-storyteller",
    version: "0.1.0",
          
    extra: {
      publicSupabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      supabaseUrl: isProduction ? process.env.SUPABASE_URL : 'http://' + process.env.LOCAL_IP + ':54321/',
      functionsUrl: isProduction ? process.env.FUNCTIONS_URL : 'http://' + process.env.LOCAL_IP + ':54321/functions/v1/',
    },
  },
}


