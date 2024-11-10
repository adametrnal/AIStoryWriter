const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

import { createClient } from "npm:@supabase/supabase-js"
import OpenAI from "https://deno.land/x/openai@v4.20.1/mod.ts";


const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const openai = new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY'),
  });

export const generateAudio = async (chapterContent: string, chapterId: string, storyId: string) => {
    console.log("generateAudio", chapterContent, chapterId, storyId);

  try {
    // Generate audio
    const response = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: 'nova',
      input: chapterContent,
      word_timestamps: true
    })

    // Store in Supabase Storage
    console.log("Audiop Open AI response", response);
    const audioBuffer = await response.arrayBuffer()
    const fileName = `${storyId}/${chapterId}.mp3`
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('audio')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true
      })

    if (uploadError) throw uploadError

    console.log("generated it correctly")
    // Get  URL
    const { data: signedUrl } = await supabase
      .storage
      .from('audio')
      .createSignedUrl(fileName, 60*60*24*365)


      console.log("Audio signedUrl", signedUrl);

    const storageUrl = signedUrl?.signedUrl.replace(
        'http://kong:8000',
        'http://192.168.50.241:54321'
      );


    console.log("Audio storageUrl", storageUrl);
    return storageUrl;
      
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 400 }
    )
  }
}