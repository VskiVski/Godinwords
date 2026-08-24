import { useEffect, useMemo, useState } from 'react';
import { MapPin, Sparkles, Eye, BookOpenText, Loader2, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Saint {
  id: string;
  name: string;
  country: string;
  country_code: string;
  feast_day: string;
  story: string;
  apparitions: string;
  miracles: string;
}

export function SaintsPage() {
  const [saints, setSaints] = useState<Saint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedSaint, setSelectedSaint] = useState<Saint | null>(null);

  useEffect(() => {
    supabase
      .from('saints')
      .select('*')
      .order('country')
      .then(({ data, error }) => {
        if (!error) setSaints(data ?? []);
        setLoading(false);
      });
  }, []);

  const countries = useMemo(() => {
    const map = new Map<string, Saint[]>();
    saints.forEach((saint) => {
      const list = map.get(saint.country) ?? [];
      list.push(saint);
      map.set(saint.country, list);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [saints]);

  const filteredSaints = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return saints;
    return saints.filter(
      (saint) =>
        saint.name.toLowerCase().includes(query) || saint.country.toLowerCase().includes(query)
    );
  }, [saints, search]);

  const visibleCountries = useMemo(() => {
    const map = new Map<string, Saint[]>();
    filteredSaints.forEach((saint) => {
      const list = map.get(saint.country) ?? [];
      list.push(saint);
      map.set(saint.country, list);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredSaints]);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#fdfaf6]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-600 font-medium mb-2">
            Mapa dos Santos
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-primary-900">Santos pelo mundo</h1>
          <p className="mt-2 text-secondary-600 max-w-xl leading-relaxed">
            Descubra os santos, aparições e milagres de cada país. Clique em um país para ver
            a história de seus santos.
          </p>
        </div>

        <div className="relative mb-8 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar santo ou país"
            className="w-full rounded-full border border-secondary-200 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 text-secondary-500 py-20">
            <Loader2 size={20} className="animate-spin" /> Carregando santos...
          </div>
        ) : visibleCountries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-secondary-500">Nenhum santo encontrado para sua busca.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="space-y-2">
              <p className="text-xs uppercase tracking-[0.15em] text-secondary-400 font-medium px-2 mb-1">
                Países ({visibleCountries.length})
              </p>
              <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-1">
                {visibleCountries.map(([country, countrySaints]) => (
                  <button
                    key={country}
                    onClick={() => setSelectedCountry(country)}
                    className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      selectedCountry === country
                        ? 'bg-primary-700 text-white'
                        : 'bg-white border border-secondary-100 text-secondary-700 hover:border-primary-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin size={15} className="flex-shrink--0" />
                      {country}
                    </span>
                    <span
                      className={`text-xs rounded-full px-2 py-0.5 ${
                        selectedCountry === country ? 'bg-white/20' : 'bg-primary-50 text-primary-700'
                      }`}
                    >
                      {countrySaints.length}
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            <section>
              {!selectedCountry ? (
                <div className="rounded-2xl border border-gold-200/60 bg-white p-8 text-center">
                  <p className="text-secondary-500">
                    Selecione um país à esquerda para ver a história de seus santos.
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="font-serif text-3xl text-primary-900 mb-4 flex items-center gap-2">
                    <MapPin size={24} className="text-primary-600" />
                    {selectedCountry}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(countries.find(([c]) => c === selectedCountry)?.[1] ?? []).map((saint) => (
                      <button
                        key={saint.id}
                        onClick={() => setSelectedSaint(saint)}
                        className="text-left rounded-xl border border-gold-200/60 bg-white p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
                      >
                        <h3 className="font-serif text-xl text-primary-900 mb-1">{saint.name}</h3>
                        {saint.feast_day && (
                          <p className="text-xs text-gold-600 font-medium mb-2">
                            Festa: {saint.feast_day}
                          </p>
                        )}
                        <p className="text-sm text-secondary-600 line-clamp-3">{saint.story}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {selectedSaint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-950/70 backdrop-blur-sm p-4"
          onClick={() => setSelectedSaint(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl bg-[#fdfaf6] shadow-2xl border border-gold-200/50 max-h-[85vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="p-7">
              <h2 className="font-serif text-3xl text-primary-900 mb-1">{selectedSaint.name}</h2>
              <p className="text-sm text-gold-600 font-medium mb-5">
                {selectedSaint.country}
                {selectedSaint.feast_day && ` · Festa: ${selectedSaint.feast_day}`}
              </p>

              <DetailSection icon={BookOpenText} title="História" text={selectedSaint.story} />
              {selectedSaint.apparitions && (
                <DetailSection icon={Eye} title="Aparições" text={selectedSaint.apparitions} />
              )}
              {selectedSaint.miracles && (
                <DetailSection icon={Sparkles} title="Milagres" text={selectedSaint.miracles} />
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function DetailSection({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof BookOpenText;
  title: string;
  text: string;
}) {
  if (!text) return null;
  return (
    <div className="mb-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-primary-800 mb-1.5">
        <Icon size={16} className="text-gold-500" /> {title}
      </h3>
      <p className="text-sm text-secondary-700 leading-relaxed">{text}</p>
    </div>
  );
}
