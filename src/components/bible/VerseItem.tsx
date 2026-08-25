import { useEffect, useRef, useState } from 'react';
import { Bookmark, BookmarkCheck, Highlighter, X } from 'lucide-react';
import { BibleVerse, HIGHLIGHT_COLORS } from '@/types/bible';

interface VerseItemProps {
  verse: BibleVerse;
  highlightColor?: string;
  isBookmarked: boolean;
  canMark: boolean;
  onToggleBookmark: (verse: BibleVerse) => void;
  onSetHighlight: (verse: number, color: string) => void;
  onRemoveHighlight: (verse: number) => void;
}

export function VerseItem({
  verse,
  highlightColor,
  isBookmarked,
  canMark,
  onToggleBookmark,
  onSetHighlight,
  onRemoveHighlight,
}: VerseItemProps) {
  const [showPalette, setShowPalette] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPalette) return;
    const handler = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        setShowPalette(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPalette]);

  const highlightClass = HIGHLIGHT_COLORS.find((c) => c.id === highlightColor)?.highlightClass;

  return (
    <div className="group relative flex gap-3 py-2.5 px-3 -mx-3 rounded-lg hover:bg-gold-50/50 transition-colors">
      <span className="flex-shrink-0 w-7 text-right text-xs font-semibold text-gold-600 pt-1 select-none">
        {verse.verse}
      </span>

      <p
        className={`flex-1 text-[1.05rem] leading-relaxed text-secondary-800 rounded px-1 ${
          highlightClass ?? ''
        }`}
      >
        {verse.text.trim()}
      </p>

      <div className="flex-shrink-0 flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="relative" ref={paletteRef}>
          <button
            onClick={() => canMark && setShowPalette((open) => !open)}
            disabled={!canMark}
            className="p-1.5 rounded-md text-secondary-400 hover:text-primary-700 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed"
            title={canMark ? 'Marcar versículo' : 'Entre para marcar'}
          >
            <Highlighter size={16} />
          </button>

          {showPalette && (
            <div className="absolute right-0 top-full mt-1 z-10 bg-white rounded-xl shadow-lg border border-secondary-100 p-2 flex flex-col gap-1 w-44">
              <div className="flex gap-1.5 px-1 pb-1.5 border-b border-secondary-100">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSetHighlight(verse.verse, c.id);
                      setShowPalette(false);
                    }}
                    className={`w-6 h-6 rounded-full ${c.swatchClass} hover:scale-110 transition-transform border border-black/5`}
                    title={c.label}
                  />
                ))}
              </div>
              {highlightColor && (
                <button
                  onClick={() => {
                    onRemoveHighlight(verse.verse);
                    setShowPalette(false);
                  }}
                  className="flex items-center gap-1.5 text-xs text-secondary-500 hover:text-primary-700 px-2 py-1.5 rounded-md hover:bg-primary-50"
                >
                  <X size={12} /> Remover marcação
                </button>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => canMark && onToggleBookmark(verse)}
          disabled={!canMark}
          className="p-1.5 rounded-md text-secondary-400 hover:text-primary-700 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed"
          title={canMark ? 'Salvar versículo' : 'Entre para salvar'}
        >
          {isBookmarked ? (
            <BookmarkCheck size={16} className="text-primary-600" />
          ) : (
            <Bookmark size={16} />
          )}
        </button>
      </div>
    </div>
  );
}
