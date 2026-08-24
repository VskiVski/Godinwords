import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { signIn, signUp, signInWithProvider } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleProviderSignIn = async (provider: 'google' | 'facebook') => {
    setError(null);
    setLoading(true);
    const result = await signInWithProvider(provider);
    setLoading(false);
    if (result.error) setError(result.error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result =
      mode === 'signin' ? await signIn(email, password) : await signUp(email, password, name);

    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-950/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-[#fdfaf6] shadow-2xl border border-gold-200/50 animate-in">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-secondary-400 hover:text-primary-700 transition-colors"
          aria-label="Fechar"
        >
          <X size={22} />
        </button>

        <div className="px-8 pt-10 pb-8">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-gold-600 font-medium mb-1">
            God in Words
          </p>
          <h2 className="text-center font-serif text-3xl text-primary-800 mb-6">
            {mode === 'signin' ? 'Bem-vindo de volta' : 'Junte-se à comunidade'}
          </h2>

          <div className="flex mb-6 rounded-full bg-secondary-50 p-1">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                mode === 'signin' ? 'bg-primary-700 text-white shadow' : 'text-secondary-600'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                mode === 'signup' ? 'bg-primary-700 text-white shadow' : 'text-secondary-600'
              }`}
            >
              Criar conta
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={() => handleProviderSignIn('google')}
              disabled={loading}
              className="rounded-lg border border-secondary-200 bg-white py-2.5 text-sm font-medium text-secondary-700 hover:border-primary-300 hover:text-primary-700 transition-colors disabled:opacity-60"
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => handleProviderSignIn('facebook')}
              disabled={loading}
              className="rounded-lg border border-secondary-200 bg-white py-2.5 text-sm font-medium text-secondary-700 hover:border-primary-300 hover:text-primary-700 transition-colors disabled:opacity-60"
            >
              Facebook
            </button>
          </div>
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px flex-1 bg-secondary-100" />
            <span className="text-xs text-secondary-400">ou use seu e-mail</span>
            <span className="h-px flex-1 bg-secondary-100" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-secondary-200 px-4 py-2.5 text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-400"
                  placeholder="Como podemos te chamar"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-secondary-200 px-4 py-2.5 text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Senha</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-secondary-200 px-4 py-2.5 text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="Mínimo de 6 caracteres"
              />
            </div>

            {error && (
              <p className="text-sm text-primary-600 bg-primary-50 border border-primary-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-medium py-2.5 transition-colors disabled:opacity-70"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {mode === 'signin' ? 'Entrar' : 'Criar minha conta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
