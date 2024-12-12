import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { generateIllustrationUrl } from "../_shared/generate-illustration.ts"
import { generateAudio } from "../_shared/generate-audio.ts"
import { ageRangeMapping } from "../_shared/age-range-mapping.ts"
import { createClient } from "npm:@supabase/supabase-js"

const SUPABASE_URL = Deno.env.get('EXPO_SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

interface RequestBody {
  characterName: string;
  characterType: string;
  ageRange: string;
  characterDescription: string;
  storyId: string;
  previousChapters: string[];
  nextChapterNumber: number;
  userId: string;
}

interface ResponseBody {
  chapterTitle: string;
  content: string;
  illustrationUrl: string;
  audioUrl: string;
}

const isValidChapterResponse = (data: unknown): data is ResponseBody => {
  return (
    data !== null &&
    typeof data === 'object' &&
    'chapterTitle' in data &&
    'content' in data &&
    typeof (data as ResponseBody).chapterTitle === 'string' &&
    typeof (data as ResponseBody).content === 'string'
  );
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const { 
      characterName, 
      characterType, 
      ageRange, 
      characterDescription, 
      storyId, 
      previousChapters, 
      nextChapterNumber, 
      userId 
    } = await req.json() as RequestBody

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that writes wonderful stories for children. 
            Your job is to write the next chapter of an ongoing story. 
            Please be creative and engaging, and follow these guidelines for ${ageRangeMapping[ageRange]} readers.
            IMPORTANT: You must respond with valid JSON in the following format:
            {
              chapterTitle: "The title of this chapter",
              content: "The content of this chapter"
            }`,
          },
          {
            role: 'user',
            content: `The character name is ${characterName}, the type of character is ${characterType}. 
            This is the story so far: ${previousChapters.join('\n\n')}
            Please generate Chapter ${nextChapterNumber}, continuing the story.`,
          },
          {
            role: 'system',
            content: `IMPORTANT: You must respond with valid JSON using exactly this format:
            {
              chapterTitle: "The title of this chapter",
              content: "The content of this chapter"
            }
            Do not include any other text or explanation outside of this JSON structure.`,
          }
        ]
      })
    })

    const data = await response.json()
    const message = data.choices[0].message.content

    try {
      const parsedChapter = JSON.parse(message)
      
      if (!isValidChapterResponse(parsedChapter)) {
        console.log('Invalid chapter response format')
        throw new Error('Invalid chapter response format')
      }

      const illustrationUrl = await generateIllustrationUrl(
        parsedChapter.content, 
        nextChapterNumber, 
        storyId, 
        characterDescription
      );
      const {audioUrl, timestampsUrl} = await generateAudio(
        parsedChapter.content, 
        nextChapterNumber, 
        storyId
      );


      const { data: chapterData, error: chapterError } = await supabase
        .from('chapters')
        .insert({
          story_id: storyId,
          content: parsedChapter.content,
          number: nextChapterNumber,
          title: parsedChapter.chapterTitle,
          illustration_url: illustrationUrl,
          audio_url: audioUrl,
          timestamps_url: timestampsUrl,
          user_id: userId
        })
        .select()
        .single();

      if (chapterError) {
        console.error("Failed to insert chapter:", chapterError);
        throw chapterError;
      }
      return new Response(JSON.stringify({chapter: chapterData}), {
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (_error) {
      return new Response(JSON.stringify({ error: 'Failed to parse story response' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } catch (error) {
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    return new Response(JSON.stringify({ error: 'An unknown error occurred' }), {
      status: 500, 
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-chapter' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
