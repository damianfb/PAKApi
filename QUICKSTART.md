# Quick Start Guide - PAKApi Database Setup

## Prerequisites
- Supabase account and project
- Access to Supabase SQL Editor or Supabase CLI

## Option 1: Using Supabase Dashboard (Easiest)

1. **Login to Supabase**
   - Go to https://supabase.com
   - Login and select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Apply First Migration**
   - Copy the entire content of `supabase/migrations/00001_create_base_tables.sql`
   - Paste into the SQL Editor
   - Click "Run" or press Ctrl+Enter
   - Wait for "Success" message

4. **Apply Second Migration**
   - Click "New query" again
   - Copy the entire content of `supabase/migrations/00002_seed_initial_data.sql`
   - Paste into the SQL Editor
   - Click "Run" or press Ctrl+Enter
   - Wait for "Success" message

5. **Verify Installation**
   - Click "New query" again
   - Run this simple verification:
   ```sql
   SELECT 'obras_sociales' as table_name, COUNT(*) as records FROM obras_sociales
   UNION ALL
   SELECT 'conductores', COUNT(*) FROM conductores
   UNION ALL
   SELECT 'destinos', COUNT(*) FROM destinos
   UNION ALL
   SELECT 'pacientes', COUNT(*) FROM pacientes;
   ```
   - You should see:
     - obras_sociales: 15 records
     - conductores: 10 records
     - destinos: 5 records
     - pacientes: 0 records (will be populated later)

## Option 2: Using Supabase CLI

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link Your Project**
   ```bash
   cd /path/to/PAKApi
   supabase link --project-ref your-project-ref
   ```
   
   To find your project ref:
   - Go to your Supabase project settings
   - Look for "Reference ID"

4. **Push Migrations**
   ```bash
   supabase db push
   ```

5. **Verify**
   ```bash
   supabase db status
   ```

## Option 3: Using psql (Advanced)

1. **Get Connection String**
   - In Supabase Dashboard, go to Project Settings > Database
   - Copy the "Connection string" (use "Transaction" pooler)
   - Replace `[YOUR-PASSWORD]` with your actual password

2. **Apply Migrations**
   ```bash
   psql "your-connection-string" -f supabase/migrations/00001_create_base_tables.sql
   psql "your-connection-string" -f supabase/migrations/00002_seed_initial_data.sql
   ```

3. **Verify**
   ```bash
   psql "your-connection-string" -f supabase/migrations/verify_schema.sql
   ```

## What Gets Created

### Tables (4)
- ✅ **obras_sociales** - 15 health insurance companies
- ✅ **conductores** - 10 drivers with licenses
- ✅ **destinos** - 5 hospitals/clinics
- ✅ **pacientes** - Patient table (empty, ready for data)

### Security
- ✅ Row Level Security enabled on all tables
- ✅ Policies for authenticated users
- ✅ Anonymous users have no access

### Automation
- ✅ updated_at triggers on all tables
- ✅ UUID auto-generation for IDs
- ✅ Timestamps with timezone

### Performance
- ✅ 5 indexes for fast queries
- ✅ Foreign keys with proper constraints

## Troubleshooting

### "relation already exists"
If you get this error, the tables already exist. You can either:
- Drop the tables and rerun (CAUTION: this deletes data)
- Skip the migration if it was already applied

### "function already exists"
This is usually safe to ignore. The function is already created.

### "permission denied"
Make sure you're using an admin connection or have proper permissions.

### RLS blocking queries
Remember: RLS is enabled. You need to:
1. Be authenticated as a Supabase user, OR
2. Query as admin using service_role key, OR
3. Use the Supabase Dashboard SQL Editor (uses service_role automatically)

## Next Steps

After successful setup:
1. ✅ Database structure is ready
2. ✅ Initial data is seeded
3. 🔜 Integrate with your API (FASE 2)
4. 🔜 Create viajes (trips) table (FASE 2)
5. 🔜 Build REST or GraphQL API (FASE 2)

## Support

For detailed documentation:
- `supabase/README.md` - Full migration guide
- `supabase/SCHEMA.md` - Database schema diagram
- `FASE1_SUMMARY.md` - Implementation summary

For Supabase help:
- https://supabase.com/docs
- https://github.com/supabase/supabase/discussions
