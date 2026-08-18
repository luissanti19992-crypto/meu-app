import { useEffect, useState } from 'react';
import { supabase, type Nota } from '@/lib/supabase';
import { Plus, X, Trash2, FileWarning, CheckCircle2, Clock, Calendar } from 'lucide-react';

export default function NotasPage() {
  const [list, setList] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filtro, setFiltro] = useState<'todas' | 'ativas' | 'vencendo' | 'vencidas'>('todas');

  const empty = {
    numero: '',
    descricao: '',
    fornecedor: '',
    data_emissao: '',
    data_vencimento: new Date().toISOString().slice(0, 10),
    valor: 0,
    status: 'ativa' as string,
  };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('notas').select('*').order('data_vencimento', { ascending: true });
    setList(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from('notas').insert({
      numero: form.numero,
      descricao: form.descricao,
      fornecedor: form.fornecedor,
      data_emissao: form.data_emissao || null,
      data_vencimento: form.data_vencimento,
      valor: Number(form.valor),
      status: form.status,
    });
    setSaving(false);
    setShowForm(false);
    setForm(empty);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta nota?')) return;
    await supabase.from('notas').delete().eq('id', id);
    load();
  }

  async function handleStatus(id: string, status: string) {
    await supabase.from('notas').update({ status }).eq('id', id);
    load();
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = list.filter((n) => {
    if (filtro === 'todas') return true;
    if (filtro === 'ativas') return n.status === 'ativa';
    if (filtro === 'vencidas') {
      return n.status === 'ativa' && new Date(n.data_vencimento) < today;
    }
    if (filtro === 'vencendo') {
      const v = new Date(n.data_vencimento);
      const diff = (v.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return n.status === 'ativa' && diff >= 0 && diff <= 30;
    }
    return true;
  });

  function getStatus(n: Nota) {
    if (n.status === 'renovada') return { label: 'Renovada', color: 'text-blue-400 bg-blue-500/10', icon: CheckCircle2 };
    if (n.status === 'ativa') {
      const v = new Date(n.data_vencimento);
      const diff = (v.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      if (diff < 0) return { label: 'Vencida', color: 'text-red-400 bg-red-500/10', icon: FileWarning };
      if (diff <= 30) return { label: `Vence em ${Math.ceil(diff)}d`, color: 'text-amber-400 bg-amber-500/10', icon: Clock };
      return { label: 'Ativa', color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle2 };
    }
    return { label: n.status, color: 'text-slate-400 bg-slate-500/10', icon: Clock };
  }

  const counts = {
    todas: list.length,
    ativas: list.filter((n) => n.status === 'ativa' && new Date(n.data_vencimento) >= today).length,
    vencendo: list.filter((n) => {
      const v = new Date(n.data_vencimento);
      const diff = (v.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return n.status === 'ativa' && diff >= 0 && diff <= 30;
    }).length,
    vencidas: list.filter((n) => n.status === 'ativa' && new Date(n.data_vencimento) < today).length,
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Notas e Vencimentos</h1>
          <p className="text-slate-400 mt-1">Controle de vencimento e renovação de notas</p>
        </div>
        <button
          onClick={() => { setForm(empty); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Nova Nota
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {([
          { key: 'todas', label: 'Todas', count: counts.todas },
          { key: 'ativas', label: 'Ativas', count: counts.ativas },
          { key: 'vencendo', label: 'Vencendo (30d)', count: counts.vencendo },
          { key: 'vencidas', label: 'Vencidas', count: counts.vencidas },
        ] as const).map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filtro === f.key ? 'bg-amber-500 text-slate-900' : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Nenhuma nota encontrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const st = getStatus(n);
            const Icon = st.icon;
            return (
              <div key={n.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-4 group">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${st.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-medium">{n.numero}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                  </div>
                  <p className="text-slate-400 text-sm truncate">{n.descricao}</p>
                  {n.fornecedor && <p className="text-slate-500 text-xs mt-0.5">Fornecedor: {n.fornecedor}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  {n.valor > 0 && <p className="text-white text-sm font-medium">R$ {Number(n.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>}
                  <p className="text-slate-400 text-xs">
                    Vence: {new Date(n.data_vencimento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {n.status === 'ativa' && (
                    <button
                      onClick={() => handleStatus(n.id, 'renovada')}
                      className="px-2 py-1 text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-md transition-colors"
                      title="Marcar como renovada"
                    >
                      Renovar
                    </button>
                  )}
                  {n.status === 'renovada' && (
                    <button
                      onClick={() => handleStatus(n.id, 'ativa')}
                      className="px-2 py-1 text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-md transition-colors"
                      title="Reativar"
                    >
                      Reativar
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-1.5 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Nova Nota</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Número</label>
                  <input type="text" required value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500" placeholder="NF-001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Fornecedor</label>
                  <input type="text" value={form.fornecedor} onChange={(e) => setForm({ ...form, fornecedor: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500" placeholder="Nome do fornecedor" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Descrição</label>
                <input type="text" required value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500" placeholder="Descrição da nota" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Data Emissão</label>
                  <input type="date" value={form.data_emissao} onChange={(e) => setForm({ ...form, data_emissao: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Data Vencimento</label>
                  <input type="date" required value={form.data_vencimento} onChange={(e) => setForm({ ...form, data_vencimento: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Valor (R$)</label>
                  <input type="number" step="any" min="0" value={form.valor} onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500">
                    <option value="ativa">Ativa</option>
                    <option value="renovada">Renovada</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-semibold rounded-lg transition-colors">
                  {saving ? 'Salvando...' : 'Salvar Nota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
