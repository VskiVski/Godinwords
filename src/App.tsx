import { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomePage } from '@/pages/HomePage';
import { BiblePage } from '@/pages/BiblePage';
import { SaintsPage } from '@/pages/SaintsPage';
import { ForumPage } from '@/pages/ForumPage';
import { VideosPage } from '@/pages/VideosPage';
import { LibraryPage } from '@/pages/LibraryPage';
import { DonationsPage } from '@/pages/DonationsPage';

export type Page = 'home' | 'bible' | 'saints' | 'forum' | 'videos' | 'library' | 'donations';

function AppContent() {
  const [page, setPage] = useState<Page>('home');
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-10 h-10 rounded-full border-2 border-primary-200 border-t-primary-700 animate-spin" />
          <p className="font-serif text-xl text-primary-800 mt-4">God in Words</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfaf6]">
      <Header page={page} onNavigate={setPage} />
      <div className="flex-1">
        {page === 'home' && <HomePage onNavigate={setPage} />}
        {page === 'bible' && <BiblePage />}
        {page === 'saints' && <SaintsPage />}
        {page === 'forum' && <ForumPage />}
        {page === 'videos' && <VideosPage />}
        {page === 'library' && <LibraryPage />}
        {page === 'donations' && <DonationsPage />}
      </div>
      <Footer onNavigate={setPage} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
