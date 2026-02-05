# Supabase Setup Guide

## Project Information

- **Project Name:** artificers-academy
- **Project Ref:** ywqcuhwpinyanmrxqkos
- **Region:** Central Europe (Zurich)
- **URL:** https://ywqcuhwpinyanmrxqkos.supabase.co

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and keys from **Settings > API**:
   - `Project URL` (e.g., `https://xxxxx.supabase.co`)
   - `anon/public` key (for frontend)
   - `service_role` key (for backend - keep secret!)

## 2. Configure Authentication

### URL Configuration

1. Go to **Authentication > URL Configuration**
2. Set **Site URL**: `https://artificers-academy.vercel.app`
3. Add **Redirect URLs**:
   - `https://artificers-academy.vercel.app/**`
   - `https://artificers-academy.vercel.app/auth/callback`
   - `http://localhost:3000/**` (for local development)

### Email Provider

1. Go to **Authentication > Providers**
2. Email provider should be enabled by default
3. Configure email templates in **Authentication > Email Templates** (optional)

## 3. Run the Migration

### Option A: Supabase Dashboard (Recommended)

1. Go to your project's **SQL Editor**
2. Run the following SQL:

```sql
-- =============================================
-- User Progress Table
-- Tracks user journey through levels and phases
-- =============================================
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  level_id TEXT NOT NULL,
  phase_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  code_snapshot TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IMPORTANT: Unique constraint for upsert operations
-- Without this, saving progress will fail with a 500 error
ALTER TABLE user_progress
ADD CONSTRAINT user_progress_unique_user_level_phase
UNIQUE (user_id, level_id, phase_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- =============================================
-- Code Snippets Table
-- Stores user's saved code snippets (Decklists)
-- =============================================
CREATE TABLE IF NOT EXISTS code_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  level_id TEXT NOT NULL,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  is_valid BOOLEAN DEFAULT FALSE,
  validation_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_code_snippets_user_id ON code_snippets(user_id);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Enable RLS on both tables
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_snippets ENABLE ROW LEVEL SECURITY;

-- Policies for user_progress
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for code_snippets
CREATE POLICY "Users can view own snippets" ON code_snippets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own snippets" ON code_snippets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own snippets" ON code_snippets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own snippets" ON code_snippets
  FOR DELETE USING (auth.uid() = user_id);
```

### Option B: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref ywqcuhwpinyanmrxqkos

# Push migrations
supabase db push
```

## 4. Configure Environment Variables

### Backend (.env)
```env
SUPABASE_URL=https://ywqcuhwpinyanmrxqkos.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://ywqcuhwpinyanmrxqkos.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database Schema

### user_progress

Tracks user journey through levels and phases.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Reference to auth.users |
| level_id | TEXT | Level identifier (e.g., 'level1') |
| phase_id | TEXT | Phase identifier (e.g., 'phase1') |
| completed | BOOLEAN | Whether phase is completed |
| code_snapshot | TEXT | Saved code for this phase |
| completed_at | TIMESTAMP | When phase was completed |
| created_at | TIMESTAMP | Record creation time |

**Constraints:**
- Unique on `(user_id, level_id, phase_id)` - required for upsert operations

### code_snippets

Stores user's saved code snippets (Decklists).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Reference to auth.users |
| level_id | TEXT | Associated level |
| title | TEXT | Snippet title |
| code | TEXT | The code content |
| is_valid | BOOLEAN | Validation status |
| validation_result | JSONB | Full validation response |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

## Row Level Security

Both tables have RLS enabled. Users can only access their own data.

The backend uses `service_role` key which bypasses RLS for administrative operations.

## Troubleshooting

### "Table not found" errors
- Run the migration SQL in the Supabase SQL Editor
- Verify tables exist in the Table Editor

### "No unique constraint" error on save
- The `user_progress` table needs a unique constraint
- Run: `ALTER TABLE user_progress ADD CONSTRAINT user_progress_unique_user_level_phase UNIQUE (user_id, level_id, phase_id);`

### RLS blocking queries
- Ensure the user is authenticated
- Check that policies are created correctly
- Backend should use `service_role` key to bypass RLS

## Useful Queries

```sql
-- View all users
SELECT * FROM auth.users;

-- View user progress
SELECT * FROM user_progress ORDER BY created_at DESC;

-- View code snippets
SELECT * FROM code_snippets ORDER BY created_at DESC;

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_progress';
```
