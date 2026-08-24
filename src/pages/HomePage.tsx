import { useState } from 'react';
import {
  BookOpenText,
  Highlighter,
  Bookmark,
  MapPin,
  MessagesSquare,
  Clapperboard,
  Library,
  HeartHandshake,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { Page } from '@/App';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

const AVAILABLE_FEATURES = [
  {
    icon: BookOpenText,
    title: 'Várias versões da Bíblia',
    description: 'Leia em português, latim e inglês, com a Bíblia católica completa disponível.',
  },
  {
    icon: Highlighter,
    title: 'Marque o que tocar seu coração',
    description: 'Destaque versículos com cores diferentes para nunca mais esquecer.',
  },
  {
    icon: Bookmark,
    title: 'Salve seus versículos favoritos',
    description: 'Guarde passagens especiais e volte a elas sempre que precisar.',
  },
];

const FEATURE_TILES = [
  {
    icon: MapPin,
    page: 'saints' as Page,
    title: 'Mapa dos Santos',
    description: 'Descubra os santos, aparições e milagres de cada país do mundo.',
    image:
      'https://images.pexels.com/photos/34573489/pexels-photo-34573489.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    icon: MessagesSquare,
    page: 'forum' as Page,
    title: 'Fórum da comunidade',
    description: 'Converse, tire dúvidas e compartilhe sua fé com outros irmãos.',
    image:
      'https://images.pexels.com/photos/9589377/pexels-photo-9589377.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    icon: Clapperboard,
    page: 'videos' as Page,
    title: 'Vídeos e pregações',
    description: 'Pregações curtas e longas para evangelizar e alimentar sua fé.',
    image:
      'https://images.pexels.com/photos/35300982/pexels-photo-35300982.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    icon: Library,
    page: 'library' as Page,
    title: 'Biblioteca católica',
    description: 'Livros católicos gratuitos para ler quando e onde quiser.',
    image:
      'https://images.pexels.com/photos/9258238/pexels-photo-9258238.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    icon: HeartHandshake,
    page: 'donations' as Page,
    title: 'Doações',
    description: 'Ajude a manter o God in Words gratuito e a espalhar a Palavra.',
    image:
      'https://images.pexels.com/photos/7219090/pexels-photo-7219090.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

export function HomePage({ onNavigate }: HomePageProps) {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/28892492/pexels-photo-28892492.jpeg?auto=compress&cs=tinysrgb&h=650&w=940')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/85 via-primary-950/80 to-[#fdfaf6]" />

        <div className="relative max-w-4xl mx-auto px-6 py-28 sm:py-36 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold-300 font-medium mb-5">
            Fé católica apostólica romana
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl text-white leading-tight mb-6">
            God in Words
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto leading-relaxed mb-10">
            Um lugar para ler e estudar a Bíblia, marcar os versículos que tocam sua alma,
            conhecer os santos de cada país e viver sua fé em comunidade com outros católicos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('bible')}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 hover:bg-gold-400 text-primary-950 font-semibold px-7 py-3 transition-colors shadow-lg"
            >
              Começar a ler a Bíblia <ArrowRight size={18} />
            </button>
            {!user && (
              <button
                onClick={() => setShowAuth(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 text-white font-medium px-7 py-3 hover:bg-white/10 transition-colors"
              >
                Criar minha conta
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-600 font-medium mb-2">
            Disponível agora
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-primary-900">
            Sua jornada com a Palavra começa aqui
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {AVAILABLE_FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-gold-200/60 bg-white p-7 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <span className="flex items-center justify-center w-11 h-11 rounded-full bg-primary-50 text-primary-700 mb-4">
                <feature.icon size={20} />
              </span>
              <h3 className="font-serif text-xl text-primary-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-secondary-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary-950 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-gold-400 font-medium mb-2">
              Tudo para sua fé
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-white">
              Uma rede social católica para você
            </h2>
            <p className="text-secondary-300 mt-4 leading-relaxed">
              Santos de cada país, fórum, vídeos de pregações, biblioteca gratuita e doações.
              Tudo em um só lugar, para viver e compartilhar a fé.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_TILES.map((feature) => (
              <button
                key={feature.title}
                onClick={() => onNavigate(feature.page)}
                className="relative rounded-2xl overflow-hidden h-56 group text-left w-full"
              >
                <img
                  src={feature.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary-950 via-secondary-950/50 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium text-gold-300 mb-2">
                    <feature.icon size={12} /> Explorar
                  </span>
                  <h3 className="font-serif text-lg text-white">{feature.title}</h3>
                  <p className="text-xs text-secondary-200 leading-relaxed mt-1">
                    {feature.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-10 text-secondary-300 text-sm">
            <HeartHandshake size={16} className="text-gold-400" />
            Feito com fé, para ajudar você a se aproximar de Deus.
          </div>
        </div>
      </section>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
