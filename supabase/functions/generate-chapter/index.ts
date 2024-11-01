import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { generateIllustrationUrl } from "../_shared/generate-illustration.ts"
import { ageRangeMapping } from "../_shared/age-range-mapping.ts"


const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

interface RequestBody {
  characterName: string;
  characterType: string;
  ageRange: string;
  storyId: string;
  previousChapters: string[];
  nextChapterNumber: number;
}

interface ResponseBody {
  chapterTitle: string;
  content: string;
  illustrationUrl: string;
}

const isValidChapterResponse = (data: any): data is ResponseBody => {
  return (
    typeof data === 'object' &&
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
    const { characterName, characterType, ageRange, storyId, previousChapters, nextChapterNumber } = await req.json() as RequestBody

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
      const illustrationUrl = await generateIllustrationUrl(parsedChapter.content, nextChapterNumber, storyId);
      const chapterWithIllustration = {
        ...parsedChapter,
        illustrationUrl: illustrationUrl
      }
      return new Response(JSON.stringify(chapterWithIllustration), {
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-chapter' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
