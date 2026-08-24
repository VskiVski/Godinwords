import { useMemo, useState } from 'react';
import {
  BookMarked,
  ChevronLeft,
  ChevronRight,
  Loader2,
  LogIn,
  Search,
  Trash2,
} from 'lucide-react';
import { useBibleReader, BookmarkRow } from '@/hooks/useBibleReader';
import { useAuth } from '@/contexts/AuthContext';
import { BIBLE_TRANSLATIONS } from '@/types/bible';
import { TranslationSelector } from '@/components/bible/TranslationSelector';
import { VerseItem } from '@/components/bible/VerseItem';
import { AuthModal } from '@/components/auth/AuthModal';

export function BiblePage() {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [search, setSearch] = useState('');

  const {
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
  } = useBibleReader();

  const currentBook = books.find((book) => book.id === bookId);
  const currentTranslation = BIBLE_TRANSLATIONS.find((item) => item.id === translation);
  const filteredBookmarks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allBookmarks;
    return allBookmarks.filter(
      (bookmark) =>
        bookmark.book_name.toLowerCase().includes(query) ||
        bookmark.verse_text.toLowerCase().includes(query)
    );
  }, [allBookmarks, search]);

  const goToChapter = (nextChapter: number) => {
    setChapter(Math.max(1, Math.min(chapterCount, nextChapter)));
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#fdfaf6]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold-600 font-medium mb-2">
              Biblioteca sagrada
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl text-primary-900">Leia a Palavra</h1>
            <p className="mt-2 text-secondary-600 max-w-xl leading-relaxed">
              Escolha uma versão, encontre um livro e estude no seu ritmo. Entre na sua conta
              para marcar e salvar os versículos que falarem ao seu coração.
            </p>
          </div>
          {user ? (
            <button
              onClick={() => setShowBookmarks((open) => !open)}
              className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ${
                showBookmarks
                  ? 'bg-primary-700 text-white border-primary-700'
                  : 'border-primary-200 text-primary-700 hover:bg-primary-50'
              }`}
            >
              <BookMarked size={17} />
              Meus versículos salvos ({allBookmarks.length})
            </button>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-200 px-5 py-2.5 text-sm font-medium text-primary-700 hover:bg-primary-50 transition-colors"
            >
              <LogIn size={17} /> Entrar para estudar
            </button>
          )}
        </div>

        <section className="rounded-2xl border border-gold-200/70 bg-white p-5 sm:p-6 shadow-sm mb-8">
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-secondary-400 font-medium mb-2">
                Versão da Bíblia
              </p>
              <TranslationSelector value={translation} onChange={changeTranslation} />
              <p className="text-xs text-secondary-400 mt-2">{currentTranslation?.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
              <div>
                <label htmlFor="bible-book" className="block text-xs uppercase tracking-[0.15em] text-secondary-400 font-medium mb-2">
                  Livro
                </label>
                <select
                  id="bible-book"
                  value={bookId}
                  onChange={(event) => selectBook(event.target.value)}
                  disabled={booksLoading || books.length === 0}
                  className="w-full rounded-lg border border-secondary-200 bg-white px-3 py-2.5 text-sm text-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-300 disabled:opacity-60"
                >
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="bible-chapter" className="block text-xs uppercase tracking-[0.15em] text-secondary-400 font-medium mb-2">
                  Capítulo
                </label>
                <select
                  id="bible-chapter"
                  value={chapter}
                  onChange={(event) => setChapter(Number(event.target.value))}
                  className="w-full sm:w-32 rounded-lg border border-secondary-200 bg-white px-3 py-2.5 text-sm text-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-300"
                >
                  {Array.from({ length: chapterCount }, (_, index) => (
                    <option key={index + 1} value={index + 1}>
                      Capítulo {index + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {showBookmarks && (
          <section className="rounded-2xl border border-primary-100 bg-primary-50/40 p-5 sm:p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="font-serif text-2xl text-primary-900">Versículos salvos</h2>
                <p className="text-sm text-secondary-600">Suas passagens favoritas em um só lugar.</p>
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar salvos"
                  className="w-full sm:w-56 rounded-full border border-secondary-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
            </div>
            {filteredBookmarks.length === 0 ? (
              <p className="text-sm text-secondary-500 py-4">Você ainda não salvou nenhum versículo.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredBookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    onOpen={() => {
                      jumpToBookmark(bookmark);
                      setShowBookmarks(false);
                    }}
                    onRemove={() => removeBookmarkRow(bookmark)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        <section className="max-w-3xl mx-auto">
          {booksError && <ErrorBox message={booksError} />}
          {versesError && <ErrorBox message={versesError} />}

          <div className="flex items-center justify-between gap-4 mb-5 border-b border-gold-200/70 pb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-gold-600 font-medium">
                {currentTranslation?.label}
              </p>
              <h2 className="font-serif text-3xl text-primary-900 mt-1">
                {currentBook?.name ?? 'Carregando'} {chapter}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToChapter(chapter - 1)}
                disabled={chapter <= 1 || versesLoading}
                className="p-2 rounded-full text-secondary-500 hover:bg-primary-50 hover:text-primary-700 disabled:opacity-30"
                aria-label="Capítulo anterior"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => goToChapter(chapter + 1)}
                disabled={chapter >= chapterCount || versesLoading}
                className="p-2 rounded-full text-secondary-500 hover:bg-primary-50 hover:text-primary-700 disabled:opacity-30"
                aria-label="Próximo capítulo"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gold-200/60 bg-white p-5 sm:p-8 shadow-sm">
            {!user && (
              <button
                onClick={() => setShowAuth(true)}
                className="w-full mb-6 rounded-lg bg-gold-50 border border-gold-200 px-4 py-3 text-sm text-secondary-700 hover:bg-gold-100 transition-colors"
              >
                Entre na sua conta para marcar e salvar versículos.
              </button>
            )}
            {versesLoading ? (
              <div className="flex items-center justify-center gap-2 text-secondary-500 py-16">
                <Loader2 size={20} className="animate-spin" /> Carregando capítulo...
              </div>
            ) : verses.length === 0 ? (
              <p className="text-center text-secondary-500 py-16">Nenhum versículo disponível.</p>
            ) : (
              <div>
                {verses.map((verse) => (
                  <VerseItem
                    key={verse.verse}
                    verse={verse}
                    highlightColor={highlights[verse.verse]}
                    isBookmarked={bookmarkedVerses.has(verse.verse)}
                    canMark={Boolean(user)}
                    onToggleBookmark={toggleBookmark}
                    onSetHighlight={setHighlight}
                    onRemoveHighlight={removeHighlight}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </main>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mb-5 rounded-lg border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-700">
      {message}
    </div>
  );
}

function BookmarkCard({
  bookmark,
  onOpen,
  onRemove,
}: {
  bookmark: BookmarkRow;
  onOpen: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl bg-white border border-primary-100 p-4">
      <button onClick={onOpen} className="text-left w-full hover:text-primary-700 transition-colors">
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
          {bookmark.book_name} {bookmark.chapter}:{bookmark.verse}
        </p>
        <p className="text-sm text-secondary-700 leading-relaxed mt-2 line-clamp-3">“{bookmark.verse_text}”</p>
      </button>
      <button
        onClick={onRemove}
        className="inline-flex items-center gap-1.5 text-xs text-secondary-400 hover:text-primary-700 mt-3"
      >
        <Trash2 size={13} /> Remover
      </button>
    </div>
  );
}
