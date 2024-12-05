import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const setupEnv = () => {
  // Determine which env file to use based on command line argument or NODE_ENV
  const envType = process.argv[2] || process.env.NODE_ENV || 'local';

  // Handle root environment files
  try {
    const rootSourceFile = `.env.${envType}`;
    console.log(`Setting up root environment from ${rootSourceFile}`);
    
    const rootEnvConfig = dotenv.parse(fs.readFileSync(rootSourceFile));
    const rootEnvContent = Object.entries(rootEnvConfig)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    fs.writeFileSync('.env', rootEnvContent);
    console.log('Successfully created root .env file');
  } catch (error) {
    console.error(`Error setting up root environment: ${error}`);
    process.exit(1);
  }

  // Handle Supabase functions environment files
  try {
    const supabaseFunctionsDir = path.join('supabase', 'functions');
    const supabaseSourceFile = path.join(supabaseFunctionsDir, `.env.${envType}`);
    console.log(`Setting up Supabase functions environment from ${supabaseSourceFile}`);
    
    const supabaseEnvConfig = dotenv.parse(fs.readFileSync(supabaseSourceFile));
    const supabaseEnvContent = Object.entries(supabaseEnvConfig)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    fs.writeFileSync(path.join(supabaseFunctionsDir, '.env'), supabaseEnvContent);
    console.log('Successfully created Supabase functions .env file');
  } catch (error) {
    console.error(`Error setting up Supabase functions environment: ${error}`);
    process.exit(1);
  }
};

setupEnv();