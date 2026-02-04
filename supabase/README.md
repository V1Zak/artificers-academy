# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and keys from Settings > API:
   - `Project URL` (e.g., `https://xxxxx.supabase.co`)
   - `anon/public` key (for frontend)
   - `service_role` key (for backend - keep secret!)

## 2. Run the Migration

### Option A: Supabase Dashboard
1. Go to your project's SQL Editor
2. Copy the contents of `migrations/001_initial_schema.sql`
3. Run the query

### Option B: Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## 3. Configure Environment Variables

### Backend (.env)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Enable Email Auth

1. Go to Authentication > Providers
2. Email provider should be enabled by default
3. Configure email templates in Authentication > Email Templates

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

## Row Level Security

Both tables have RLS enabled. Users can only access their own data.

The backend uses `service_role` key which bypasses RLS, but validates user ownership in the application layer.
