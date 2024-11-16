// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { generateIllustrationUrl } from "../_shared/generate-illustration.ts"
import { generateAudio } from "../_shared/generate-audio.ts"
import { ageRangeMapping } from "../_shared/age-range-mapping.ts"
import { getCharacterDescription } from "../_shared/generate-character-description.ts"
import { createClient } from "npm:@supabase/supabase-js"

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface RequestBody {
  storyId: string;
  characterName: string;
  characterType: string;
  ageRange: string;
  genre: string;
  descriptor: string;
  userId: string;
}

interface ResponseBody {
  storyName: string;
  chapterTitle: string;
  content: string;
  characterDescription: string;
  illustrationUrl: string;
  audioUrl: string;
}


const isValidStoryResponse = (data: any): data is ResponseBody => {
  return (
    typeof data === 'object' &&
    typeof data.storyName === 'string' &&
    typeof data.chapterTitle === 'string' &&
    typeof data.content === 'string' 
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
    const { characterName, characterType, ageRange, storyId, genre, descriptor, userId } = await req.json() as RequestBody
    console.log("userId", userId);

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
            Your job is to write a story for the user, one chapter at a time. The user will click a button to generate the next chapter. 
            Please be creative and engaging, and follow these guidelines: ${ageRangeMapping[ageRange]}.
            IMPORTANT: You must respond with valid JSON in the following format:
            {
              storyName: "The title of the complete story",
              chapterTitle: "The title of the first chapter",
              content: "The content of the first chapter"
            }`,
          },
          {
            role: 'user',
            content: `The character name is a ${characterName}, the type of character is a ${characterType}. 
            The defining characteristic of the character is that it is ${descriptor}. The genre of the story is ${genre}.`,
          },
        ]
      })
    })

    const data = await response.json()
    const message = data.choices[0].message.content

    try {
      const parsedStory = JSON.parse(message)
      if (!isValidStoryResponse(parsedStory)) {
        throw new Error('Invalid story response format')
      }

      const characterDescription = await getCharacterDescription(characterName, parsedStory.content);
      const illustrationUrl = await generateIllustrationUrl(parsedStory.content, 1, storyId, characterDescription);
      const {audioUrl, timestampsUrl} = await generateAudio(parsedStory.content, 1, storyId);
      // Save the story to the database // First, create the story
      const { data: storyData, error: storyDBError } = await supabase
      .from('stories')
      .insert({
        title: parsedStory.storyName,
        character_name: characterName,
        character_type: characterType,
        character_description: characterDescription,
        age_range: ageRange,
        genre: genre,
        descriptor: descriptor,
        user_id: userId
      })
      .select()
      .single();

      // After the insert
      if (storyDBError) {
        console.error("Failed to insert story:", storyDBError);
        throw storyDBError;
      } else {
        console.log("Successfully inserted story:", storyData);
      }

       // Then create the chapter
      const { data: chapterData, error: chapterDBError } = await supabase
      .from('chapters')
      .insert({
        story_id: storyData.id,
        content: parsedStory.content,
        number: 1,
        title: parsedStory.chapterTitle,
        illustration_url: illustrationUrl,
        audio_url: audioUrl,
        timestamps_url: timestampsUrl,
        user_id: userId
      })
      .select()
      .single();

       // After the insert
       if (chapterDBError) {
        console.error("Failed to insert chapter:", chapterDBError);
        throw chapterDBError;
      } else {
        console.log("Successfully inserted chapter:", chapterData);
      }

      return new Response(JSON.stringify({story: storyData, chapter: chapterData}), {
        headers: { 'Content-Type': 'application/json' }
      })

    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to parse story response' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-story' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
