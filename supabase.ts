import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface Fase {
  id: string;
  nome: string;
  descricao: string;
  ordem: number;
  created_at: string;
}

export interface Servico {
  id: string;
  fase_id: string;
  nome: string;
  unidade: string;
  meta_producao: number;
  created_at: string;
}

export interface Fvs {
  id: string;
  data: string;
  fiscal: string;
  foto_url: string;
  acontecimento: string;
  produtividade: number;
  realizado_por: string;
  fase_id: string | null;
  servico_id: string | null;
  created_at: string;
}

export interface Nota {
  id: string;
  numero: string;
  descricao: string;
  fornecedor: string;
  data_emissao: string | null;
  data_vencimento: string;
  valor: number;
  status: string;
  created_at: string;
}
