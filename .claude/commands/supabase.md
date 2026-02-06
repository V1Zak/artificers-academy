# Supabase Database Skill

Manage Supabase database and authentication for The Artificer's Academy.

## Project Info
- **Project URL:** https://ywqcuhwpinyanmrxqkos.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/ywqcuhwpinyanmrxqkos

## Available Commands

When this skill is invoked, use the Supabase CLI with SUPABASE_ACCESS_TOKEN:

### List Projects
```bash
SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN npx supabase projects list
```

### Check Database Status
```bash
SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN npx supabase db remote status
```

### Run Migrations
```bash
SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN npx supabase db push
```

### Generate Types
```bash
SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN npx supabase gen types typescript --project-id ywqcuhwpinyanmrxqkos
```

## Database Schema

### user_progress
```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  level_id TEXT NOT NULL,
  phase_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  code_snapshot TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_progress_unique_user_level_phase
    UNIQUE (user_id, level_id, phase_id)
);
```

### code_snippets
```sql
CREATE TABLE code_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  level_id TEXT NOT NULL,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  is_valid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Row Level Security (RLS)
Both tables have RLS enabled:
- Users can only read/write their own data
- Service role key bypasses RLS (backend use only)

## Common Issues
1. **Auth session missing**: Upgrade `@supabase/ssr` to 0.8.0+
2. **Upsert failures**: Ensure unique constraint exists on user_progress
3. **RLS blocking requests**: Check policies allow the operation

## Critical Notes
- **Never expose service key** in frontend code
- **Always use anon key** for client-side operations
- Unique constraint on user_progress is REQUIRED for upsert

## Usage
Invoke with `/supabase` followed by what you want to do:
- `/supabase status` - Check database status
- `/supabase schema` - Show current schema
- `/supabase migrate` - Run pending migrations
- `/supabase users` - List recent users (admin)
