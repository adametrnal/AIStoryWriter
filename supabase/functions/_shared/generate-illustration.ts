const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

import { createClient } from "npm:@supabase/supabase-js"
import Replicate from "npm:replicate"

const replicate = new Replicate({
    auth: REPLICATE_API_KEY
  });

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const generateIllustrationUrl = async (prompt: string, chapterNumber: number, storyId: string) => {
    const modelName = "black-forest-labs/flux-schnell";
    
    const input = {
      prompt: prompt,
    }

    const output = await replicate.run(modelName, { input });
  
    try {
        const firstImage = output[0];
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('illustrations')
          .upload(
            `${storyId}/${chapterNumber}.png`,
            firstImage,
            {
              contentType: 'image/png',
              upsert: true
            }
          );
    
        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          return '';
        }
    
        // Get public URL
        const { data: signedUrl } = await supabase
          .storage
          .from('illustrations')
          .createSignedUrl(`${storyId}/${chapterNumber}.png`, 60 * 60 * 24 * 365);
  
        console.log("signedUrl", signedUrl);
          //TODO: Figure out why supabase URL is kong:8000
        const storageUrl = signedUrl?.signedUrl.replace(
          'http://kong:8000',
          'http://192.168.50.241:54321'
        );
    
        return storageUrl;
        
    } catch (error) {
        console.error('Error generating illustration:', error);
        return '';
    }
  
}
   
  