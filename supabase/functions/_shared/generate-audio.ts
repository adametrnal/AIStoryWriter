const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

import { createClient } from "npm:@supabase/supabase-js"
import OpenAI from "https://deno.land/x/openai@v4.20.1/mod.ts";

//todo: is this actually used?
interface WhisperResponse {
  text: string;
  words: {
    word: string;
    start: number;
    end: number;
  }[];
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
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
      input: chapterContent
    })

    // Store in Supabase Storage
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

    const transcription = await openai.audio.transcriptions.create({
        file: new File([audioBuffer], 'audio.mp3', { type: 'audio/mpeg' }),
        model: 'whisper-1',
        response_format: 'verbose_json',
        timestamp_granularities: ['word'],
      });

    const timestampsFileName = `${storyId}/${chapterId}_timestamps.json`;
    await supabase
      .storage
      .from('audio')
      .upload(timestampsFileName, JSON.stringify(transcription.words), {
        contentType: 'application/json',
        upsert: true
      });

      console.log("1");
    // Get  URL
    const { data: signedUrl } = await supabase
      .storage
      .from('audio')
      .createSignedUrl(fileName, 60*60*24*365)

      console.log("2");
    console.log("Audio signedUrl", signedUrl);

    const { data: timestampsSignedUrl } = await supabase
      .storage
      .from('audio')
      .createSignedUrl(timestampsFileName, 60*60*24*365);

      console.log("3");

    const audioUrl = signedUrl?.signedUrl.replace(
        'http://kong:8000',
        'http://192.168.50.241:54321'
      );
    console.log("Audio storageUrl", audioUrl);
    console.log("4");

    const timestampsUrl = timestampsSignedUrl?.signedUrl.replace(
        'http://kong:8000',
        'http://192.168.50.241:54321'
      );

      console.log("5");
    console.log("Audio and timestamps urls", audioUrl, timestampsUrl);
    return {
        audioUrl, 
        timestampsUrl,
    };

      
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 400 }
    )
  }
}