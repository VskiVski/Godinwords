import { BibleBook, BibleVerse } from '@/types/bible';

const BASE_URL = 'https://bible-api.com/data';

const bookListCache = new Map<string, BibleBook[]>();
const chapterCountCache = new Map<string, number>();
const verseCache = new Map<string, BibleVerse[]>();

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao buscar dados da Bíblia (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export async function getBooks(translation: string): Promise<BibleBook[]> {
  const cached = bookListCache.get(translation);
  if (cached) return cached;

  const data = await fetchJson<{ books: BibleBook[] }>(`${BASE_URL}/${translation}`);
  const books = data.books ?? [];
  bookListCache.set(translation, books);
  return books;
}

export async function getChapterCount(translation: string, bookId: string): Promise<number> {
  const key = `${translation}:${bookId}`;
  const cached = chapterCountCache.get(key);
  if (cached) return cached;

  const data = await fetchJson<{ chapters?: { chapter: number }[] }>(
    `${BASE_URL}/${translation}/${bookId}`
  );
  const count = data.chapters?.length ?? 1;
  chapterCountCache.set(key, count);
  return count;
}

export async function getChapterVerses(
  translation: string,
  bookId: string,
  chapter: number
): Promise<BibleVerse[]> {
  const key = `${translation}:${bookId}:${chapter}`;
  const cached = verseCache.get(key);
  if (cached) return cached;

  const data = await fetchJson<{ verses: BibleVerse[] }>(
    `${BASE_URL}/${translation}/${bookId}/${chapter}`
  );
  const verses = data.verses ?? [];
  verseCache.set(key, verses);
  return verses;
}
