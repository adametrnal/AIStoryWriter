import { createClient } from "npm:@supabase/supabase-js"
// import { corsHeaders } from "../_shared/cors.ts"

const SUPABASE_URL = Deno.env.get('EXPO_SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

Deno.serve(async (req) => {
  // Handle CORS
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { headers: corsHeaders })
//   }
console.log("got request for stories");
console.log("Get Stories: SUPABASE_URL", SUPABASE_URL);
console.log("Get Stories: SUPABASE_SERVICE_ROLE_KEY", SUPABASE_SERVICE_ROLE_KEY);
console.log("Get Stories: supabase", supabase);
  try {
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    const body = await req.json();
    console.log("Request body:", body);
    
    // Extract user ID from the request
    const { userId } = body;
    console.log("Request headers:", req.headers);
    console.log("Get Stories: userId", userId);

    if (!userId) {
      throw new Error('User ID is required');
    }

     // Let's try a simpler query first to test the connection
     const { data, error } = await supabase
     .from('stories')
     .select('id') // just select ID first to minimize data
     .limit(1);    // limit to 1 row

   if (error) {
     console.error("Supabase query error details:", {
       errorMessage: error.message,
       errorCode: error.code,
       errorDetails: error.details,
       hint: error.hint
     });
     throw error;
   }

   console.log("Query successful, found data:", data);
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
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )

  } catch (error) {
    console.error("Error in get-stories function:", error);
    return new Response(JSON.stringify({
        error: error.message || 'Unknown error occurred',
        stack: error.stack
    }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})