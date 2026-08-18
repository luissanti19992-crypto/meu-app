import { useEffect, useState } from 'react';
import { supabase, type Fvs, type Fase, type Servico } from '@/lib/supabase';
import { Plus, X, Camera, Trash2, Search, Image as ImageIcon, ClipboardList } from 'lucide-react';

export default function FvsPage() {
  const [list, setList] = useState<Fvs[]>([]);
  const [fases, setFases] = useState<Fase[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filtroFase, setFiltroFase] = useState<string>('');

  const empty = {
    data: new Date().toISOString().slice(0, 10),
    fiscal: '',
    foto_url: '',
    acontecimento: '',
    produtividade: 0,
    realizado_por: '',
    fase_id: '',
    servico_id: '',
  };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    const [fvsRes, fasesRes, servRes] = await Promise.all([
      supabase.from('fvs').select('*').order('data', { ascending: false }),
      supabase.from('fases').select('*').order('ordem'),
      supabase.from('servicos').select('*'),
    ]);
    setList(fvsRes.data ?? []);
    setFases(fasesRes.data ?? []);
    setServicos(servRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `fvs/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('fvs-photos').upload(path, file);
    if (upErr) {
      // bucket might not exist — try to create it
      await supabase.storage.createBucket('fvs-photos', { public: true });
      const { error: upErr2 } = await supabase.storage.from('fvs-photos').upload(path, file);
      if (upErr2) { setUploading(false); return; }
    }
    const { data: urlData } = supabase.storage.from('fvs-photos').getPublicUrl(path);
    setForm((f) => ({ ...f, foto_url: urlData.publicUrl }));
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      data: form.data,
      fiscal: form.fiscal,
      foto_url: form.foto_url,
      acontecimento: form.acontecimento,
      produtividade: Number(form.produtividade),
      realizado_por: form.realizado_por,
      fase_id: form.fase_id || null,
      servico_id: form.servico_id || null,
    };
    await supabase.from('fvs').insert(payload);
    setSaving(false);
    setShowForm(false);
    setForm(empty);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este FVS?')) return;
    await supabase.from('fvs').delete().eq('id', id);
    load();
  }

  const servicosFase = servicos.filter((s) => !form.fase_id || s.fase_id === form.fase_id);

  const filtered = list.filter((fvs) => {
    const matchSearch = !search ||
      fvs.fiscal.toLowerCase().includes(search.toLowerCase()) ||
      fvs.realizado_por.toLowerCase().includes(search.toLowerCase()) ||
      fvs.acontecimento.toLowerCase().includes(search.toLowerCase());
    const matchFase = !filtroFase || fvs.fase_id === filtroFase;
    return matchSearch && matchFase;
  });

  const faseNome = (id: string | null) => fases.find((f) => f.id === id)?.nome ?? '—';
  const servicoNome = (id: string | null) => servicos.find((s) => s.id === id)?.nome ?? '—';

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">FVS — Fiscalização de Serviços</h1>
          <p className="text-slate-400 mt-1">{list.length} registros</p>
        </div>
        <button
          onClick={() => { setForm(empty); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Novo FVS
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por fiscal, responsável ou acontecimento..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <select
          value={filtroFase}
          onChange={(e) => setFiltroFase(e.target.value)}
          className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
        >
          <option value="">Todas as fases</option>
          {fases.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
          <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Nenhum FVS encontrado. Clique em "Novo FVS" para começar.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((fvs) => (
            <div key={fvs.id} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden group">
              {fvs.foto_url ? (
                <img src={fvs.foto_url} alt="FVS" className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-slate-900/50 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-slate-600" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-400 text-sm font-medium">
                    {new Date(fvs.data).toLocaleDateString('pt-BR')}
                  </span>
                  <button
                    onClick={() => handleDelete(fvs.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-white text-sm"><span className="text-slate-500">Fiscal:</span> {fvs.fiscal}</p>
                <p className="text-white text-sm"><span className="text-slate-500">Realizado por:</span> {fvs.realizado_por}</p>
                <p className="text-white text-sm"><span className="text-slate-500">Fase:</span> {faseNome(fvs.fase_id)}</p>
                <p className="text-white text-sm"><span className="text-slate-500">Serviço:</span> {servicoNome(fvs.servico_id)}</p>
                {fvs.acontecimento && (
                  <p className="text-slate-400 text-sm mt-2 line-clamp-2">{fvs.acontecimento}</p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full">
                    Produtividade: {Number(fvs.produtividade)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Novo FVS</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Data</label>
                  <input type="date" required value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Fiscal</label>
                  <input type="text" required value={form.fiscal} onChange={(e) => setForm({ ...form, fiscal: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500" placeholder="Nome do fiscal" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Realizado por</label>
                  <input type="text" required value={form.realizado_por} onChange={(e) => setForm({ ...form, realizado_por: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500" placeholder="Equipe / responsável" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Produtividade</label>
                  <input type="number" step="any" value={form.produtividade} onChange={(e) => setForm({ ...form, produtividade: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Fase</label>
                  <select value={form.fase_id} onChange={(e) => setForm({ ...form, fase_id: e.target.value, servico_id: '' })}
                    className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500">
                    <option value="">Selecione...</option>
                    {fases.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Serviço</label>
                  <select value={form.servico_id} onChange={(e) => setForm({ ...form, servico_id: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500">
                    <option value="">Selecione...</option>
                    {servicosFase.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Acontecimento</label>
                <textarea value={form.acontecimento} onChange={(e) => setForm({ ...form, acontecimento: e.target.value })} rows={3}
                  className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 resize-none"
                  placeholder="Descrição do que ocorreu na fiscalização..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Foto</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                    <Camera className="w-4 h-4" />
                    {uploading ? 'Enviando...' : 'Enviar foto'}
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                  </label>
                  {form.foto_url && (
                    <img src={form.foto_url} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-semibold rounded-lg transition-colors">
                  {saving ? 'Salvando...' : 'Salvar FVS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
