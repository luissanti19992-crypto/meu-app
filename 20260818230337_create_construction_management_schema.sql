/*
# Construction Management Schema

## Overview
Creates the complete database schema for a construction site management app with:
- FVS (Fiscalização de Serviços) records with photos, inspector info, productivity
- Note/contract expiration tracking with renewal alerts
- Construction phases and their services
- Productivity tracking per phase and service

## New Tables

1. `fases` — Construction phases (e.g., foundation, structure, finishing)
2. `servicos` — Services within each phase
3. `fvs` — FVS records (service inspection reports)
4. `notas` — Notes/contracts with expiration tracking

## Security
- RLS enabled on all tables.
- Owner-scoped CRUD policies (auth.uid() = user_id) for all 4 verbs on each table.
- user_id columns default to auth.uid() so inserts work without explicit owner.
*/

-- ============ FASES ============
CREATE TABLE IF NOT EXISTS fases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text DEFAULT '',
  ordem int DEFAULT 0,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_fases" ON fases;
CREATE POLICY "select_own_fases" ON fases FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_fases" ON fases;
CREATE POLICY "insert_own_fases" ON fases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_fases" ON fases;
CREATE POLICY "update_own_fases" ON fases FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_fases" ON fases;
CREATE POLICY "delete_own_fases" ON fases FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ SERVICOS ============
CREATE TABLE IF NOT EXISTS servicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fase_id uuid NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
  nome text NOT NULL,
  unidade text DEFAULT 'un',
  meta_producao numeric DEFAULT 0,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_servicos" ON servicos;
CREATE POLICY "select_own_servicos" ON servicos FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_servicos" ON servicos;
CREATE POLICY "insert_own_servicos" ON servicos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_servicos" ON servicos;
CREATE POLICY "update_own_servicos" ON servicos FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_servicos" ON servicos;
CREATE POLICY "delete_own_servicos" ON servicos FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ FVS ============
CREATE TABLE IF NOT EXISTS fvs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL,
  fiscal text NOT NULL,
  foto_url text DEFAULT '',
  acontecimento text DEFAULT '',
  produtividade numeric DEFAULT 0,
  realizado_por text NOT NULL,
  fase_id uuid REFERENCES fases(id) ON DELETE SET NULL,
  servico_id uuid REFERENCES servicos(id) ON DELETE SET NULL,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fvs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_fvs" ON fvs;
CREATE POLICY "select_own_fvs" ON fvs FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_fvs" ON fvs;
CREATE POLICY "insert_own_fvs" ON fvs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_fvs" ON fvs;
CREATE POLICY "update_own_fvs" ON fvs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_fvs" ON fvs;
CREATE POLICY "delete_own_fvs" ON fvs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ NOTAS ============
CREATE TABLE IF NOT EXISTS notas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text NOT NULL,
  descricao text NOT NULL,
  fornecedor text DEFAULT '',
  data_emissao date,
  data_vencimento date NOT NULL,
  valor numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'ativa',
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notas" ON notas;
CREATE POLICY "select_own_notas" ON notas FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notas" ON notas;
CREATE POLICY "insert_own_notas" ON notas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notas" ON notas;
CREATE POLICY "update_own_notas" ON notas FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notas" ON notas;
CREATE POLICY "delete_own_notas" ON notas FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_fvs_user_id ON fvs(user_id);
CREATE INDEX IF NOT EXISTS idx_fvs_data ON fvs(data);
CREATE INDEX IF NOT EXISTS idx_notas_user_id ON notas(user_id);
CREATE INDEX IF NOT EXISTS idx_notas_vencimento ON notas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_servicos_fase_id ON servicos(fase_id);
CREATE INDEX IF NOT EXISTS idx_fvs_fase_id ON fvs(fase_id);
CREATE INDEX IF NOT EXISTS idx_fvs_servico_id ON fvs(servico_id);
