import 'dotenv/config';

export default {
  expo: {
    name: "AI Storyteller",
    slug: "ai-storyteller",
    
    extra: {
      openaiApiKey: process.env.OPENAI_API_KEY,
    },
  },
};