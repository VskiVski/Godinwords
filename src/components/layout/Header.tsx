import { useState } from 'react';
import { BookOpenText, Cross, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { Page } from '@/App';

interface HeaderProps {
  page: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { page: Page; label: string }[] = [
  { page: 'home', label: 'Início' },
  { page: 'bible', label: 'Bíblia' },
  { page: 'saints', label: 'Santos' },
  { page: 'forum', label: 'Fórum' },
  { page: 'videos', label: 'Vídeos' },
  { page: 'library', label: 'Biblioteca' },
  { page: 'donations', label: 'Doações' },
];

export function Header({ page, onNavigate }: HeaderProps) {
  const { user, displayName, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = (target: Page) => {
    onNavigate(target);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fdfaf6]/95 backdrop-blur-sm border-b border-gold-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <button onClick={() => navigate('home')} className="flex items-center gap-2 group">
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-800 text-gold-300 group-hover:bg-primary-900 transition-colors">
            <Cross size={18} />
          </span>
          <span className="font-serif text-xl text-primary-900 tracking-wide">God in Words</span>
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.page}
              onClick={() => navigate(item.page)}
              className={`text-sm font-medium transition-colors relative py-1 ${
                page === item.page ? 'text-primary-800' : 'text-secondary-600 hover:text-primary-700'
              }`}
            >
              {item.label}
              {page === item.page && (
                <span className="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-gold-500 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-secondary-700">
                Que a paz esteja com você, <span className="font-medium text-primary-800">{displayName}</span>
              </span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 text-sm text-secondary-500 hover:text-primary-700 transition-colors"
              >
                <LogOut size={16} /> Sair
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="rounded-full bg-primary-700 hover:bg-primary-800 text-white text-sm font-medium px-5 py-2 transition-colors shadow-sm"
            >
              Entrar
            </button>
          )}
        </div>

        <button
          className="md:hidden text-secondary-700"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Abrir menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gold-200/60 px-4 py-4 space-y-3 bg-[#fdfaf6]">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.page}
              onClick={() => navigate(item.page)}
              className={`flex items-center gap-2 w-full text-left text-sm font-medium py-1 ${
                page === item.page ? 'text-primary-800' : 'text-secondary-600'
              }`}
            >
              <BookOpenText size={16} /> {item.label}
            </button>
          ))}
          {user ? (
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-sm text-secondary-500 py-1"
            >
              <LogOut size={16} /> Sair ({displayName})
            </button>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="w-full rounded-full bg-primary-700 text-white text-sm font-medium px-5 py-2"
            >
              Entrar
            </button>
          )}
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </header>
  );
}
