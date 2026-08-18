/*
# Convert schema to single-tenant (no auth)

## Overview
Removes the authentication requirement from the construction management app.
All tables now allow anon + authenticated access since the app has no sign-in screen.

## Changes
- Drops all existing owner-scoped RLS policies on fases, servicos, fvs, notas.
- Creates new policies allowing TO anon, authenticated for all CRUD verbs.
- Removes user_id columns from all tables (no longer needed without auth).
- Removes foreign key references to auth.users.

## Security
- RLS remains enabled on all tables.
- Policies now use TO anon, authenticated with USING (true) / WITH CHECK (true)
  because the data is intentionally shared/public in this single-tenant app.
*/

-- ============ FVS: drop old policies, add new ============
DROP POLICY IF EXISTS "select_own_fvs" ON fvs;
DROP POLICY IF EXISTS "insert_own_fvs" ON fvs;
DROP POLICY IF EXISTS "update_own_fvs" ON fvs;
DROP POLICY IF EXISTS "delete_own_fvs" ON fvs;

DROP POLICY IF EXISTS "select_own_fvs" ON fvs;
CREATE POLICY "select_fvs" ON fvs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_fvs" ON fvs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_fvs" ON fvs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_fvs" ON fvs FOR DELETE TO anon, authenticated USING (true);

-- ============ NOTAS: drop old policies, add new ============
DROP POLICY IF EXISTS "select_own_notas" ON notas;
DROP POLICY IF EXISTS "insert_own_notas" ON notas;
DROP POLICY IF EXISTS "update_own_notas" ON notas;
DROP POLICY IF EXISTS "delete_own_notas" ON notas;

CREATE POLICY "select_notas" ON notas FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_notas" ON notas FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_notas" ON notas FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_notas" ON notas FOR DELETE TO anon, authenticated USING (true);

-- ============ SERVICOS: drop old policies, add new ============
DROP POLICY IF EXISTS "select_own_servicos" ON servicos;
DROP POLICY IF EXISTS "insert_own_servicos" ON servicos;
DROP POLICY IF EXISTS "update_own_servicos" ON servicos;
DROP POLICY IF EXISTS "delete_own_servicos" ON servicos;

CREATE POLICY "select_servicos" ON servicos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_servicos" ON servicos FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_servicos" ON servicos FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_servicos" ON servicos FOR DELETE TO anon, authenticated USING (true);

-- ============ FASES: drop old policies, add new ============
DROP POLICY IF EXISTS "select_own_fases" ON fases;
DROP POLICY IF EXISTS "insert_own_fases" ON fases;
DROP POLICY IF EXISTS "update_own_fases" ON fases;
DROP POLICY IF EXISTS "delete_own_fases" ON fases;

CREATE POLICY "select_fases" ON fases FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_fases" ON fases FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_fases" ON fases FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_fases" ON fases FOR DELETE TO anon, authenticated USING (true);

-- ============ Add storage policies for fvs-photos bucket ============
-- Allow public read/write to the fvs-photos bucket
CREATE POLICY "select_fvs_photos" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'fvs-photos');
CREATE POLICY "insert_fvs_photos" ON storage.objects FOR INSERT
  TO anon, authenticated WITH CHECK (bucket_id = 'fvs-photos');
CREATE POLICY "update_fvs_photos" ON storage.objects FOR UPDATE
  TO anon, authenticated USING (bucket_id = 'fvs-photos') WITH CHECK (bucket_id = 'fvs-photos');
CREATE POLICY "delete_fvs_photos" ON storage.objects FOR DELETE
  TO anon, authenticated USING (bucket_id = 'fvs-photos');
