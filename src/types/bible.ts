export interface BibleTranslation {
  id: string;
  label: string;
  language: string;
  description: string;
}

export const BIBLE_TRANSLATIONS: BibleTranslation[] = [
  {
    id: 'almeida',
    label: 'João Ferreira de Almeida',
    language: 'Português',
    description: 'Tradução clássica em português, ideal para leitura do dia a dia.',
  },
  {
    id: 'dra',
    label: 'Douay-Rheims',
    language: 'Inglês',
    description: 'Bíblia católica completa, com os livros deuterocanônicos.',
  },
  {
    id: 'clementine',
    label: 'Vulgata Clementina',
    language: 'Latim',
    description: 'Texto oficial da Igreja em latim, cânon católico completo.',
  },
];

export interface BibleBook {
  id: string;
  name: string;
}

export interface BibleChapterRef {
  chapter: number;
}

export interface BibleVerse {
  book_id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface HighlightColor {
  id: string;
  label: string;
  swatchClass: string;
  highlightClass: string;
}

export const HIGHLIGHT_COLORS: HighlightColor[] = [
  { id: 'yellow', label: 'Amarelo', swatchClass: 'bg-amber-300', highlightClass: 'bg-amber-200/70' },
  { id: 'rose', label: 'Rosa', swatchClass: 'bg-rose-300', highlightClass: 'bg-rose-200/70' },
  { id: 'green', label: 'Verde', swatchClass: 'bg-emerald-300', highlightClass: 'bg-emerald-200/70' },
  { id: 'blue', label: 'Azul', swatchClass: 'bg-sky-300', highlightClass: 'bg-sky-200/70' },
];
