import { HardHat, Menu, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';

type Page = 'dashboard' | 'fvs' | 'notas' | 'fases';

interface LayoutProps {
  current: Page;
  onNavigate: (p: Page) => void;
  children: ReactNode;
}

const NAV: { key: Page; label: string; icon: typeof HardHat }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: HardHat },
  { key: 'fvs', label: 'FVS', icon: ClipboardList },
  { key: 'notas', label: 'Notas e Vencimentos', icon: FileWarning },
  { key: 'fases', label: 'Fases e Serviços', icon: Layers },
];

// Inline imports to keep single-file simplicity
import { LayoutDashboard, ClipboardList, FileWarning, Layers } from 'lucide-react';

export default function Layout({ current, onNavigate, children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = current === item.key;
        return (
          <button
            key={item.key}
            onClick={() => { onNavigate(item.key); setMobileOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              active ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-950/50 border-r border-slate-800 p-4 hidden lg:flex flex-col">
        <div className="flex items-center gap-3 px-2 py-4 mb-4">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
            <HardHat className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <h1 className="text-white font-bold">ObraFlow</h1>
            <p className="text-xs text-slate-500">Gestão de Obras</p>
          </div>
        </div>
        {navItems}
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <HardHat className="w-5 h-5 text-slate-900" />
            </div>
            <span className="text-white font-bold">ObraFlow</span>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-slate-400">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t border-slate-800 p-4">
            {navItems}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
