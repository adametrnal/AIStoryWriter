const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
const SUPABASE_URL = Deno.env.get('EXPO_SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

import { createClient } from "npm:@supabase/supabase-js"
import Replicate from "npm:replicate"

const replicate = new Replicate({
    auth: REPLICATE_API_KEY
  });

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export const generateIllustrationUrl = async (prompt: string, chapterNumber: number, storyId: string, characterDescription: string) => {
    const modelName = "black-forest-labs/flux-schnell";
    
    const basePrompt = "A beautiful, hand-painted illustration for a children's story book, whimsical and colorful, suitable for young readers. IMPORTANT: There is no text in the image. ";
    const characterPrompt = characterDescription ? `The main character looks like: ${characterDescription}. ` : '';
    const input = {
      prompt: basePrompt + characterPrompt + prompt,
    }
    console.log("generateIllustrationInput", input);
    const output = await replicate.run(modelName, { input });
  
    try {
        const firstImage = output[0];
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase
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
        console.log("supabase url", SUPABASE_URL);
        // Get public URL
        const { data: signedUrl } = await supabase
          .storage
          .from('illustrations')
          .createSignedUrl(`${storyId}/${chapterNumber}.png`, 60 * 60 * 24 * 365);
  
        console.log("signedUrl", signedUrl);

        const storageUrl = signedUrl?.signedUrl;
    
        return storageUrl;
        
    } catch (error) {
        console.error('Error generating illustration:', error);
        return '';
    }
  
}
   
  