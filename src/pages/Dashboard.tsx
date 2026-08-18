import { useEffect, useState, useMemo } from 'react';
import { supabase, type Fvs, type Nota, type Fase } from '@/lib/supabase';
import { BarChart, LineChart, DonutChart } from '@/components/Charts';
import { TrendingUp, FileWarning, ClipboardList, Calendar } from 'lucide-react';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function Dashboard() {
  const [fvsList, setFvsList] = useState<Fvs[]>([]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [fases, setFases] = useState<Fase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [fvsRes, notasRes, fasesRes] = await Promise.all([
        supabase.from('fvs').select('*').order('data', { ascending: true }),
        supabase.from('notas').select('*').order('data_vencimento', { ascending: true }),
        supabase.from('fases').select('*').order('ordem', { ascending: true }),
      ]);

      setFvsList(fvsRes.data ?? []);
      setNotas(notasRes.data ?? []);
      setFases(fasesRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const today = new Date();
  const notasVencendo = notas.filter((n) => {
    const v = new Date(n.data_vencimento);
    const diff = (v.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 30 && n.status === 'ativa';
  });
  const notasVencidas = notas.filter((n) => {
    return new Date(n.data_vencimento) < today && n.status === 'ativa';
  });

  const produtividadePorFase = fases.map((f, i) => {
    const fvsFase = fvsList.filter((fvs) => fvs.fase_id === f.id);
    const total = fvsFase.reduce((s, fvs) => s + Number(fvs.produtividade), 0);
    return { label: f.nome, value: total, color: COLORS[i % COLORS.length] };
  }).filter((d) => d.value > 0);

  const fvsPorMes = useMemo(() => {
    const map: Record<string, number> = {};
    fvsList.forEach((fvs) => {
      const d = new Date(fvs.data);
      const key = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear().toString().slice(2)}`;
      map[key] = (map[key] ?? 0) + 1;
    });
    return Object.entries(map).slice(-8).map(([label, value]) => ({ label, value }));
  }, [fvsList]);

  const produtividadeTemporal = useMemo(() => {
    const map: Record<string, number> = {};
    fvsList.forEach((fvs) => {
      const d = new Date(fvs.data);
      const key = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear().toString().slice(2)}`;
      map[key] = (map[key] ?? 0) + Number(fvs.produtividade);
    });
    return Object.entries(map).slice(-8).map(([label, value]) => ({ label, value }));
  }, [fvsList]);

  const statusNotas = [
    { label: 'Ativas', value: notas.filter((n) => n.status === 'ativa').length, color: '#10b981' },
    { label: 'Vencidas', value: notasVencidas.length, color: '#ef4444' },
    { label: 'Renovadas', value: notas.filter((n) => n.status === 'renovada').length, color: '#3b82f6' },
  ].filter((d) => d.value > 0);

  const stats = [
    { label: 'Total FVS', value: fvsList.length, icon: ClipboardList, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Notas Vencendo', value: notasVencendo.length, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Notas Vencidas', value: notasVencidas.length, icon: FileWarning, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Fases Ativas', value: fases.length, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Visão geral da obra</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <div className={`inline-flex w-10 h-10 rounded-lg items-center justify-center ${s.bg} mb-3`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-slate-400 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Produtividade por Fase</h2>
          <BarChart data={produtividadePorFase} unit="" />
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Evolução da Produtividade</h2>
          <LineChart data={produtividadeTemporal} />
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">FVS por Mês</h2>
          <BarChart data={fvsPorMes.map((d) => ({ ...d, color: '#3b82f6' }))} />
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Status das Notas</h2>
          <DonutChart data={statusNotas.length > 0 ? statusNotas : [{ label: 'Sem notas', value: 0, color: '#64748b' }]} />
        </div>
      </div>

      {notasVencendo.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <FileWarning className="w-5 h-5 text-blue-400" />
            Notas Vencendo nos Próximos 30 Dias
          </h2>
          <div className="space-y-2">
            {notasVencendo.map((n) => {
              const v = new Date(n.data_vencimento);
              const diff = Math.ceil((v.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const vencida = diff < 0;
              return (
                <div key={n.id} className="flex items-center justify-between bg-slate-900/40 rounded-lg p-3">
                  <div>
                    <span className="text-white font-medium">{n.numero}</span>
                    <span className="text-slate-400 text-sm ml-2">{n.descricao}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-sm">
                      {new Date(n.data_vencimento).toLocaleDateString('pt-BR')}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      vencida ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {vencida ? `Vencida ${Math.abs(diff)}d` : `${diff}d`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
