import { useEffect, useState } from 'react';
import { supabase, type Fase, type Servico, type Fvs } from '@/lib/supabase';
import { Plus, X, Trash2, ChevronDown, ChevronRight, Layers, Wrench, TrendingUp } from 'lucide-react';

export default function FasesPage() {
  const [fases, setFases] = useState<Fase[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [fvsList, setFvsList] = useState<Fvs[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showFaseForm, setShowFaseForm] = useState(false);
  const [showServForm, setShowServForm] = useState<string | null>(null);

  const [faseForm, setFaseForm] = useState({ nome: '', descricao: '', ordem: 0 });
  const [servForm, setServForm] = useState({ nome: '', unidade: 'un', meta_producao: 0 });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const [fasesRes, servRes, fvsRes] = await Promise.all([
      supabase.from('fases').select('*').order('ordem'),
      supabase.from('servicos').select('*'),
      supabase.from('fvs').select('*'),
    ]);
    setFases(fasesRes.data ?? []);
    setServicos(servRes.data ?? []);
    setFvsList(fvsRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleFaseSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from('fases').insert({
      nome: faseForm.nome,
      descricao: faseForm.descricao,
      ordem: Number(faseForm.ordem),
    });
    setSaving(false);
    setShowFaseForm(false);
    setFaseForm({ nome: '', descricao: '', ordem: 0 });
    load();
  }

  async function handleServSubmit(e: React.FormEvent, faseId: string) {
    e.preventDefault();
    setSaving(true);
    await supabase.from('servicos').insert({
      fase_id: faseId,
      nome: servForm.nome,
      unidade: servForm.unidade,
      meta_producao: Number(servForm.meta_producao),
    });
    setSaving(false);
    setShowServForm(null);
    setServForm({ nome: '', unidade: 'un', meta_producao: 0 });
    load();
  }

  async function deleteFase(id: string) {
    if (!confirm('Excluir esta fase e todos os seus serviços?')) return;
    await supabase.from('fases').delete().eq('id', id);
    load();
  }

  async function deleteServico(id: string) {
    if (!confirm('Excluir este serviço?')) return;
    await supabase.from('servicos').delete().eq('id', id);
    load();
  }

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Fases e Serviços</h1>
          <p className="text-slate-400 mt-1">Organize a obra em fases e acompanhe a produtividade de cada serviço</p>
        </div>
        <button
          onClick={() => setShowFaseForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Nova Fase
        </button>
      </div>

      {fases.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Nenhuma fase cadastrada. Clique em "Nova Fase" para começar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fases.map((fase, idx) => {
            const faseServs = servicos.filter((s) => s.fase_id === fase.id);
            const faseFvs = fvsList.filter((f) => f.fase_id === fase.id);
            const totalProd = faseFvs.reduce((s, f) => s + Number(f.produtividade), 0);
            const color = COLORS[idx % COLORS.length];
            const isOpen = expanded.has(fase.id);

            return (
              <div key={fase.id} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-800/80 transition-colors"
                  onClick={() => toggle(fase.id)}
                >
                  {isOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                  <div className="w-3 h-10 rounded-full" style={{ backgroundColor: color }} />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{fase.nome}</h3>
                    {fase.descricao && <p className="text-slate-400 text-sm">{fase.descricao}</p>}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="text-slate-500 text-xs">Serviços</p>
                      <p className="text-white font-medium">{faseServs.length}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-xs">FVS</p>
                      <p className="text-white font-medium">{faseFvs.length}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-xs">Produtividade</p>
                      <p className="text-white font-medium">{totalProd.toLocaleString('pt-BR')}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteFase(fase.id); }}
                      className="text-slate-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-slate-700 p-4 space-y-3">
                    {faseServs.length === 0 ? (
                      <p className="text-slate-500 text-sm py-2">Nenhum serviço nesta fase ainda.</p>
                    ) : (
                      faseServs.map((serv) => {
                        const servFvs = faseFvs.filter((f) => f.servico_id === serv.id);
                        const servProd = servFvs.reduce((s, f) => s + Number(f.produtividade), 0);
                        const meta = Number(serv.meta_producao);
                        const pct = meta > 0 ? Math.min((servProd / meta) * 100, 100) : 0;

                        return (
                          <div key={serv.id} className="bg-slate-900/40 rounded-lg p-3 group">
                            <div className="flex items-center gap-3 mb-2">
                              <Wrench className="w-4 h-4 text-slate-500 flex-shrink-0" />
                              <div className="flex-1">
                                <span className="text-white text-sm font-medium">{serv.nome}</span>
                                <span className="text-slate-500 text-xs ml-2">({serv.unidade})</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="text-slate-400">Meta: {meta}</span>
                                <span className="text-emerald-400">Prod: {servProd}</span>
                                <span className="text-slate-400">{servFvs.length} FVS</span>
                                <button
                                  onClick={() => deleteServico(serv.id)}
                                  className="text-slate-600 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            {meta > 0 && (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? '#10b981' : '#f59e0b' }}
                                  />
                                </div>
                                <span className="text-xs text-slate-400 w-10 text-right">{pct.toFixed(0)}%</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}

                    {showServForm === fase.id ? (
                      <form onSubmit={(e) => handleServSubmit(e, fase.id)} className="bg-slate-900/60 rounded-lg p-3 space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <input type="text" required placeholder="Nome do serviço" value={servForm.nome}
                            onChange={(e) => setServForm({ ...servForm, nome: e.target.value })}
                            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" />
                          <input type="text" placeholder="Unidade" value={servForm.unidade}
                            onChange={(e) => setServForm({ ...servForm, unidade: e.target.value })}
                            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" />
                          <input type="number" step="any" placeholder="Meta" value={servForm.meta_producao}
                            onChange={(e) => setServForm({ ...servForm, meta_producao: Number(e.target.value) })}
                            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" />
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setShowServForm(null)}
                            className="px-3 py-1.5 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-600">Cancelar</button>
                          <button type="submit" disabled={saving}
                            className="px-3 py-1.5 bg-amber-500 text-slate-900 text-sm font-medium rounded-lg hover:bg-amber-400 disabled:opacity-50">
                            {saving ? 'Salvando...' : 'Adicionar'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => { setServForm({ nome: '', unidade: 'un', meta_producao: 0 }); setShowServForm(fase.id); }}
                        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-amber-400 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar serviço
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showFaseForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Nova Fase</h2>
              <button onClick={() => setShowFaseForm(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleFaseSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nome da fase</label>
                <input type="text" required value={faseForm.nome} onChange={(e) => setFaseForm({ ...faseForm, nome: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  placeholder="Ex: Fundação, Estrutura, Acabamento..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Descrição</label>
                <textarea value={faseForm.descricao} onChange={(e) => setFaseForm({ ...faseForm, descricao: e.target.value })} rows={2}
                  className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Ordem</label>
                <input type="number" value={faseForm.ordem} onChange={(e) => setFaseForm({ ...faseForm, ordem: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowFaseForm(false)}
                  className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">Cancelar</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-semibold rounded-lg transition-colors">
                  {saving ? 'Salvando...' : 'Salvar Fase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
