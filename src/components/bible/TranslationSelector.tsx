import { BIBLE_TRANSLATIONS } from '@/types/bible';

interface TranslationSelectorProps {
  value: string;
  onChange: (translation: string) => void;
}

export function TranslationSelector({ value, onChange }: TranslationSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {BIBLE_TRANSLATIONS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          title={t.description}
          className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
            value === t.id
              ? 'bg-primary-700 text-white border-primary-700'
              : 'bg-white text-secondary-600 border-secondary-200 hover:border-primary-300 hover:text-primary-700'
          }`}
        >
          {t.label} <span className="opacity-70">· {t.language}</span>
        </button>
      ))}
    </div>
  );
}
