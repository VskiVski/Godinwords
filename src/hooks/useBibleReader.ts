import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getBooks, getChapterCount, getChapterVerses } from '@/lib/bibleApi';
import { BibleBook, BibleVerse } from '@/types/bible';
import { useAuth } from '@/contexts/AuthContext';

export interface BookmarkRow {
  id: string;
  translation: string;
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  verse_text: string;
  created_at: string;
}

const DEFAULT_TRANSLATION = 'almeida';

export function useBibleReader() {
  const { user } = useAuth();

  const [translation, setTranslationState] = useState(DEFAULT_TRANSLATION);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [booksError, setBooksError] = useState<string | null>(null);

  const [bookId, setBookIdState] = useState('GEN');
  const [chapterCount, setChapterCount] = useState(1);
  const [chapter, setChapter] = useState(1);

  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [versesLoading, setVersesLoading] = useState(true);
  const [versesError, setVersesError] = useState<string | null>(null);

  const [highlights, setHighlights] = useState<Record<number, string>>({});
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<number>>(new Set());
  const [allBookmarks, setAllBookmarks] = useState<BookmarkRow[]>([]);

  const pendingChapterRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setBooksLoading(true);
    setBooksError(null);

    getBooks(translation)
      .then((data) => {
        if (cancelled) return;
        setBooks(data);
        setBookIdState((prev) => (data.some((b) => b.id === prev) ? prev : data[0]?.id ?? 'GEN'));
      })
      .catch(() => {
        if (!cancelled) setBooksError('Não foi possível carregar a lista de livros.');
      })
      .finally(() => {
        if (!cancelled) setBooksLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [translation]);

  useEffect(() => {
    if (!bookId) return;
    let cancelled = false;

    getChapterCount(translation, bookId)
      .then((count) => {
        if (cancelled) return;
        setChapterCount(count);
        const pending = pendingChapterRef.current;
        pendingChapterRef.current = null;
        setChapter(pending && pending <= count ? pending : 1);
      })
      .catch(() => {
        if (!cancelled) setChapterCount(1);
      });

    return () => {
      cancelled = true;
    };
  }, [translation, bookId]);

  useEffect(() => {
    if (!bookId || !chapter) return;
    let cancelled = false;
    setVersesLoading(true);
    setVersesError(null);

    getChapterVerses(translation, bookId, chapter)
      .then((data) => {
        if (!cancelled) setVerses(data);
      })
      .catch(() => {
        if (!cancelled) setVersesError('Não foi possível carregar este capítulo agora.');
      })
      .finally(() => {
        if (!cancelled) setVersesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [translation, bookId, chapter]);

  const refreshChapterMarks = useCallback(async () => {
    if (!user) {
      setHighlights({});
      setBookmarkedVerses(new Set());
      return;
    }

    const [highlightsRes, bookmarksRes] = await Promise.all([
      supabase
        .from('bible_highlights')
        .select('verse, color')
        .eq('translation', translation)
        .eq('book_id', bookId)
        .eq('chapter', chapter),
      supabase
        .from('bible_bookmarks')
        .select('verse')
        .eq('translation', translation)
        .eq('book_id', bookId)
        .eq('chapter', chapter),
    ]);

    const highlightMap: Record<number, string> = {};
    (highlightsRes.data ?? []).forEach((row) => {
      highlightMap[row.verse] = row.color;
    });
    setHighlights(highlightMap);
    setBookmarkedVerses(new Set((bookmarksRes.data ?? []).map((row) => row.verse)));
  }, [user, translation, bookId, chapter]);

  useEffect(() => {
    refreshChapterMarks();
  }, [refreshChapterMarks]);

  const refreshAllBookmarks = useCallback(async () => {
    if (!user) {
      setAllBookmarks([]);
      return;
    }
    const { data } = await supabase
      .from('bible_bookmarks')
      .select('id, translation, book_id, book_name, chapter, verse, verse_text, created_at')
      .order('created_at', { ascending: false });
    setAllBookmarks(data ?? []);
  }, [user]);

  useEffect(() => {
    refreshAllBookmarks();
  }, [refreshAllBookmarks]);

  const changeTranslation = useCallback(
    (next: string) => {
      pendingChapterRef.current = chapter;
      setTranslationState(next);
    },
    [chapter]
  );

  const selectBook = useCallback((next: string) => {
    pendingChapterRef.current = null;
    setBookIdState(next);
  }, []);

  const jumpToBookmark = useCallback(
    (row: BookmarkRow) => {
      pendingChapterRef.current = row.chapter;
      if (row.translation !== translation) setTranslationState(row.translation);
      setBookIdState(row.book_id);
    },
    [translation]
  );

  const setHighlight = useCallback(
    async (verse: number, color: string) => {
      if (!user) return;
      await supabase
        .from('bible_highlights')
        .upsert(
          { translation, book_id: bookId, chapter, verse, color },
          { onConflict: 'user_id,translation,book_id,chapter,verse' }
        );
      setHighlights((prev) => ({ ...prev, [verse]: color }));
    },
    [user, translation, bookId, chapter]
  );

  const removeHighlight = useCallback(
    async (verse: number) => {
      if (!user) return;
      await supabase
        .from('bible_highlights')
        .delete()
        .eq('translation', translation)
        .eq('book_id', bookId)
        .eq('chapter', chapter)
        .eq('verse', verse);
      setHighlights((prev) => {
        const next = { ...prev };
        delete next[verse];
        return next;
      });
    },
    [user, translation, bookId, chapter]
  );

  const toggleBookmark = useCallback(
    async (verse: BibleVerse) => {
      if (!user) return;
      const isBookmarked = bookmarkedVerses.has(verse.verse);
      const book = books.find((b) => b.id === bookId);

      if (isBookmarked) {
        await supabase
          .from('bible_bookmarks')
          .delete()
          .eq('translation', translation)
          .eq('book_id', bookId)
          .eq('chapter', chapter)
          .eq('verse', verse.verse);
      } else {
        await supabase.from('bible_bookmarks').upsert(
          {
            translation,
            book_id: bookId,
            book_name: book?.name ?? verse.book,
            chapter,
            verse: verse.verse,
            verse_text: verse.text.trim(),
          },
          { onConflict: 'user_id,translation,book_id,chapter,verse' }
        );
      }

      setBookmarkedVerses((prev) => {
        const next = new Set(prev);
        if (isBookmarked) next.delete(verse.verse);
        else next.add(verse.verse);
        return next;
      });
      refreshAllBookmarks();
    },
    [user, translation, bookId, chapter, bookmarkedVerses, books, refreshAllBookmarks]
  );

  const removeBookmarkRow = useCallback(
    async (row: BookmarkRow) => {
      await supabase
        .from('bible_bookmarks')
        .delete()
        .eq('translation', row.translation)
        .eq('book_id', row.book_id)
        .eq('chapter', row.chapter)
        .eq('verse', row.verse);
      setAllBookmarks((prev) => prev.filter((b) => b.id !== row.id));
      if (row.book_id === bookId && row.chapter === chapter && row.translation === translation) {
        setBookmarkedVerses((prev) => {
          const next = new Set(prev);
          next.delete(row.verse);
          return next;
        });
      }
    },
    [bookId, chapter, translation]
  );

  return {
    translation,
    changeTranslation,
    books,
    booksLoading,
    booksError,
    bookId,
    selectBook,
    chapterCount,
    chapter,
    setChapter,
    verses,
    versesLoading,
    versesError,
    highlights,
    bookmarkedVerses,
    allBookmarks,
    setHighlight,
    removeHighlight,
    toggleBookmark,
    removeBookmarkRow,
    jumpToBookmark,
  };
}
