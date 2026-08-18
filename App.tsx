import { useState } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import FvsPage from '@/pages/FvsPage';
import NotasPage from '@/pages/NotasPage';
import FasesPage from '@/pages/FasesPage';

type Page = 'dashboard' | 'fvs' | 'notas' | 'fases';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');

  return (
    <Layout current={page} onNavigate={setPage}>
      {page === 'dashboard' && <Dashboard />}
      {page === 'fvs' && <FvsPage />}
      {page === 'notas' && <NotasPage />}
      {page === 'fases' && <FasesPage />}
    </Layout>
  );
}
