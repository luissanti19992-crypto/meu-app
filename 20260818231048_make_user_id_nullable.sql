/*
# Make user_id columns nullable for no-auth app

## Overview
Without authentication, auth.uid() returns NULL. The user_id columns are NOT NULL 
with DEFAULT auth.uid(), which would cause inserts to fail. This migration makes 
user_id nullable and removes the auth.uid() default so inserts work without a session.

## Changes
- Alter user_id on fases, servicos, fvs, notas: drop NOT NULL, drop DEFAULT, drop FK to auth.users.
*/

ALTER TABLE fvs ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE fvs ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE fvs DROP CONSTRAINT IF EXISTS fvs_user_id_fkey;

ALTER TABLE notas ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE notas ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE notas DROP CONSTRAINT IF EXISTS notas_user_id_fkey;

ALTER TABLE servicos ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE servicos ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE servicos DROP CONSTRAINT IF EXISTS servicos_user_id_fkey;

ALTER TABLE fases ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE fases ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE fases DROP CONSTRAINT IF EXISTS fases_user_id_fkey;
