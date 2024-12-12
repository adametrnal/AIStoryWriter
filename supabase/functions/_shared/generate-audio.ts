const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('EXPO_SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

import { createClient } from "npm:@supabase/supabase-js"
import OpenAI from "https://deno.land/x/openai@v4.20.1/mod.ts";

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
    apiKey: OPENAI_API_KEY,
  });

export const generateAudio = async (
  chapterContent: string, 
  chapterId: number, 
  storyId: string): Promise<{audioUrl: string; timestampsUrl: string}> => {

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
    
    const { error: uploadError } = await supabase
      .storage
      .from('audio')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true
      })

    if (uploadError) throw uploadError

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
    // Get  URL
    const { data: signedUrl } = await supabase
      .storage
      .from('audio')
      .createSignedUrl(fileName, 60*60*24*365)

    const { data: timestampsSignedUrl } = await supabase
      .storage
      .from('audio')
      .createSignedUrl(timestampsFileName, 60*60*24*365);


    console.log("Audio and timestamps urls", signedUrl, timestampsSignedUrl);
    return {
        audioUrl: signedUrl?.signedUrl, 
        timestampsUrl: timestampsSignedUrl?.signedUrl,
    };

      
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate audio: ${error.message}`);
    }
    throw new Error('Failed to generate audio: Unknown error');
  }
}