-- ============================================
-- The Artificer's Academy - Database Schema
-- ============================================
-- Run this in your Supabase SQL Editor
-- Or use: supabase db push

-- ============================================
-- User Progress Table
-- Tracks Planeswalker journey through levels
-- ============================================
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    level_id TEXT NOT NULL,
    phase_id TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    code_snapshot TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one entry per user/level/phase combination
    UNIQUE(user_id, level_id, phase_id)
);

-- Index for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- Index for querying progress by level
CREATE INDEX IF NOT EXISTS idx_user_progress_level ON user_progress(user_id, level_id);

-- ============================================
-- Code Snippets Table (Decklists)
-- Stores saved code snippets for users
-- ============================================
CREATE TABLE IF NOT EXISTS code_snippets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    level_id TEXT NOT NULL,
    title TEXT NOT NULL,
    code TEXT NOT NULL,
    is_valid BOOLEAN DEFAULT FALSE,
    validation_result JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_code_snippets_user_id ON code_snippets(user_id);

-- Index for querying snippets by level
CREATE INDEX IF NOT EXISTS idx_code_snippets_level ON code_snippets(user_id, level_id);

-- ============================================
-- Row Level Security (RLS) Policies
-- Users can only access their own data
-- ============================================

-- Enable RLS on tables
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_snippets ENABLE ROW LEVEL SECURITY;

-- User Progress Policies
CREATE POLICY "Users can view own progress"
    ON user_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
    ON user_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
    ON user_progress FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
    ON user_progress FOR DELETE
    USING (auth.uid() = user_id);

-- Code Snippets Policies
CREATE POLICY "Users can view own snippets"
    ON code_snippets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own snippets"
    ON code_snippets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own snippets"
    ON code_snippets FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own snippets"
    ON code_snippets FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- Updated At Trigger
-- Automatically update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_code_snippets_updated_at
    BEFORE UPDATE ON code_snippets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Service Role Access (for backend API)
-- The backend uses service_role key which
-- bypasses RLS, allowing it to manage all data
-- ============================================
-- Note: When using service_role key from backend,
-- RLS is bypassed. The backend validates user_id
-- matches the authenticated user from the request.
