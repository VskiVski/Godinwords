import { Cross, Heart } from 'lucide-react';
import { Page } from '@/App';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

const FEATURES: { label: string; page: Page }[] = [
  { label: 'Bíblia', page: 'bible' },
  { label: 'Santos pelo mundo', page: 'saints' },
  { label: 'Fórum da comunidade', page: 'forum' },
  { label: 'Vídeos e pregações', page: 'videos' },
  { label: 'Biblioteca católica', page: 'library' },
  { label: 'Doações', page: 'donations' },
];

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-primary-950 text-primary-100 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-10 sm:grid-cols-2">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-300">
              <Cross size={16} />
            </span>
            <span className="font-serif text-lg text-white">God in Words</span>
          </div>
          <p className="text-sm text-primary-200 leading-relaxed max-w-sm">
            Um espaço para ler, estudar e viver a Palavra de Deus em comunidade,
            à luz da fé católica apostólica romana.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold-400 font-medium mb-3">
            Explore
          </p>
          <ul className="space-y-1.5 text-sm text-primary-200">
            {FEATURES.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => onNavigate(item.page)}
                  className="flex items-center gap-2 hover:text-gold-300 transition-colors"
                >
                  <Heart size={12} className="text-gold-400 flex-shrink-0" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-900/60 py-4 text-center text-xs text-primary-300">
        God in Words — feito com fé, para a fé.
      </div>
    </footer>
  );
}
