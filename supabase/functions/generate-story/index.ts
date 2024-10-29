// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment

import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

interface RequestBody {
  characterName: string;
  characterType: string;
  ageRange: string;
}

const ageRangeMapping: Record<string, string> = {
  'Baby': 'Focus on simple, repetitive language with familiar objects like animals, colors, and basic emotions (happy, sad). Keep the tone soothing and the story no longer than a few sentences per chapter. Only use one simple word per sentence for example: Run spot run.',
  'Toddler': 'Use simple language but introduce slightly more complex ideas like curiosity, friendship, and problem-solving. Use familiar settings and playful characters. Chapters should be short with some gentle excitement or discoveries. Keep the tone soothing and the story no longer than 4-6 sentences per chapter. It should be appropriate for a 3 year old child.',
  'Young Reader': 'Introduce slightly more developed plotlines and challenges. Use adventure, exploration, and basic conflicts with resolutions. The story can include a few paragraphs per chapter and involve character development and teamwork.',
  'Advanced Reader': 'Focus on more complex plots with emotional depth, longer chapters, and character growth. Include adventure, learning, problem-solving, and more detailed world-building. Suitable for readers beginning to enjoy longer, more nuanced stories.',
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const { characterName, characterType, ageRange } = await req.json() as RequestBody

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that generates stories for children.
            Your job is to generate a story for the user, one chapter at a time. The user will click a button to generate the next chapter. 
            Please be creative and engaging, and follow these guidelines: ${ageRangeMapping[ageRange]}.`,
          },
          {
            role: 'user',
            content: `The character name is a ${characterName}, the type of character is a ${characterType}.`,
          },
        ]
      })
    })

    const data = await response.json()
    return new Response(JSON.stringify({ content: data.choices[0].message.content }), {
      headers: { 'Content-Type': 'application/json' }
    })

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
