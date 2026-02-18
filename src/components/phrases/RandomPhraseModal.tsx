import { MessageSquareQuote, RefreshCw, X } from 'lucide-react';
import type { Phrase, PhraseCategory } from '../../types';

interface RandomPhraseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phrase: Phrase | null;
  categories: PhraseCategory[];
  onNewRandom: () => void;
}

export default function RandomPhraseModal({ open, onOpenChange, phrase, categories, onNewRandom }: RandomPhraseModalProps) {
  if (!open || !phrase) return null;

  const category = categories.find(c => c.id === phrase.categoryId);
  const subcategory = category?.subcategories.find(s => s.id === phrase.subcategoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-card shadow-2xl">
        {/* Header */}
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquareQuote className="h-5 w-5 text-white" />
              <h2 className="text-lg font-semibold text-white">Frase Aleatoria</h2>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Quote */}
          <div className="relative mb-6">
            <MessageSquareQuote className="absolute -top-2 -left-2 h-10 w-10 text-purple-200 dark:text-purple-900 opacity-30" />
            <p className="pl-10 text-2xl leading-relaxed text-foreground italic font-light">
              "{phrase.text}"
            </p>
          </div>

          {/* Author */}
          {phrase.author && (
            <p className="mb-6 text-base font-medium text-muted-foreground text-right">
              — {phrase.author}
            </p>
          )}

          {/* Badges */}
          <div className="mb-6 flex flex-wrap gap-2">
            {category && (
              <span className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {category.name}
              </span>
            )}
            {subcategory && (
              <span className="rounded-lg bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                {subcategory.name}
              </span>
            )}
          </div>

          {/* Notes */}
          {phrase.notes && (
            <div className="mb-6 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              <p className="text-xs font-semibold text-foreground mb-2">Notas personales:</p>
              {phrase.notes}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onNewRandom}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Otra Frase
            </button>
            
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
