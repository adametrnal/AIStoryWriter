

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

export const getCharacterDescription = async (characterName: string, content: string) => {
    // Get character description
    const characterResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that creates consistent visual descriptions of story characters. 
            Descriptions are concise, 2-3 sentences and optimized for sending to image generation LLMs to help them to 
            create consitent images`
          },
          {
            role: 'user',
            content: `Based on this story, create a detailed visual description of the main character (${characterName}): ${content}`
          }
        ]
      })
    })
    const characterData = await characterResponse.json();
    const characterDescription = characterData.choices[0].message.content;
    return characterDescription;
  }
   
  