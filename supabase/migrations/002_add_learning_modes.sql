-- Migration: Add learning modes support
-- Adds mode column to user_progress and creates user_preferences table

-- 1. Add mode column to user_progress (defaults to 'mtg' for backward compatibility)
ALTER TABLE user_progress
ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'mtg';

-- 2. Drop old unique constraint and add new one including mode
ALTER TABLE user_progress
DROP CONSTRAINT IF EXISTS user_progress_unique_user_level_phase;

ALTER TABLE user_progress
ADD CONSTRAINT user_progress_unique_user_mode_level_phase
UNIQUE (user_id, mode, level_id, phase_id);

-- 3. Add index for efficient mode-filtered queries
CREATE INDEX IF NOT EXISTS idx_user_progress_mode
ON user_progress(user_id, mode);

-- 4. Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    active_mode TEXT NOT NULL DEFAULT 'mtg',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT valid_mode CHECK (active_mode IN ('simple', 'detailed', 'mtg'))
);

-- 5. Add check constraint for mode on user_progress
ALTER TABLE user_progress
ADD CONSTRAINT valid_progress_mode CHECK (mode IN ('simple', 'detailed', 'mtg'));

-- 6. Enable RLS on user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 7. RLS policies for user_preferences
CREATE POLICY "Users can view own preferences"
ON user_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
ON user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
ON user_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- 8. Updated_at trigger for user_preferences
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
