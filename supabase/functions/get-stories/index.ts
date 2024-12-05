import { createClient } from "npm:@supabase/supabase-js"
// import { corsHeaders } from "../_shared/cors.ts"

const SUPABASE_URL = Deno.env.get('EXPO_SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('EXPO_SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  // Handle CORS
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { headers: corsHeaders })
//   }
console.log("got request for stories");
  try {
    // Extract user ID from the request
    const { userId } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get all stories for this user
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select(`
        *,
        chapters (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (storiesError) {
      throw storiesError;
    }

    return new Response(
      JSON.stringify({ stories }),
      { 
        headers: { 
          'Content-Type': 'application/json'
        } 
      }
    )

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: message }), 
      { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json'
        }
      }
    )
  }
})