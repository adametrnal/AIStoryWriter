-- Create stories table
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    character_name TEXT NOT NULL,
    character_type TEXT NOT NULL,
    character_description TEXT,
    age_range TEXT NOT NULL,
    genre TEXT NOT NULL,
    descriptor TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create chapters table
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES stories(id) NOT NULL,
    content TEXT NOT NULL,
    number INTEGER NOT NULL,
    title TEXT NOT NULL,
    illustration_url TEXT,
    audio_url TEXT,
    timestamps_url TEXT,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add your RLS policies
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Policies for stories
CREATE POLICY "Users can insert their own stories"
    ON stories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own stories"
    ON stories FOR SELECT
    USING (auth.uid() = user_id);

-- Policies for chapters
CREATE POLICY "Users can insert their own chapters"
    ON chapters FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own chapters"
    ON chapters FOR SELECT
    USING (auth.uid() = user_id);