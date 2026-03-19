import { useState, useEffect } from 'react';
import { X, Shuffle, Hash, EyeOff, Loader2 } from 'lucide-react';
import { phrasesAPI } from '@/services/api';
import type { ReviewPlanConfig } from '@/services/api';
import type { Phrase, PhraseCategory } from '@/types';

interface ReviewPlan {
  id: number;
  name: string;
  targets: string[];
  config: ReviewPlanConfig;
}

interface PlanConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: ReviewPlan;
  categories: PhraseCategory[];
  onSave: (planId: number, config: ReviewPlanConfig) => Promise<void>;
}

const mapBackendPhrase = (item: any): Phrase => ({
  id: item.id.toString(),
  text: item.texto,
  author: item.autor || undefined,
  categoryId: item.categoria_id?.toString(),
  subcategoryId: item.subcategoria_id?.toString(),
  notes: item.notas || undefined,
  active: item.activa,
  reviewCount: item.total_repasos || 0,
  lastReviewedAt: item.ultima_vez || undefined,
  createdAt: item.fecha_creacion,
});

export default function PlanConfigModal({ open, onOpenChange, plan, categories, onSave }: PlanConfigModalProps) {
  const [config, setConfig] = useState<ReviewPlanConfig>({ ...plan.config });
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loadingPhrases, setLoadingPhrases] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sincronizar config cuando cambia el plan o se abre el modal
  useEffect(() => {
    if (open) {
      setConfig({
        shuffle: plan.config.shuffle ?? false,
        daily_limit: plan.config.daily_limit ?? null,
        excluded_phrase_ids: plan.config.excluded_phrase_ids ?? [],
      });
      fetchPhrases();
    }
  }, [open, plan.id]);

  const fetchPhrases = async () => {
    setLoadingPhrases(true);
    const byId = new Map<string, Phrase>();

    try {
      for (const target of plan.targets) {
        const [type, categoryId, subcategoryId] = target.split(':');
        let page = 1;
        let totalPages = 1;

        do {
          const response = await phrasesAPI.getPhrases(
            page,
            100,
            categoryId,
            type === 'sub' ? subcategoryId : undefined,
            true,
          );
          response.items.map(mapBackendPhrase).forEach(p => byId.set(p.id, p));
          totalPages = response.pages || 1;
          page += 1;
        } while (page <= totalPages);
      }
    } catch (err) {
      console.error('Error loading phrases for plan config:', err);
    }

    setPhrases(Array.from(byId.values()));
    setLoadingPhrases(false);
  };

  const isExcluded = (phraseId: string) =>
    config.excluded_phrase_ids.includes(Number(phraseId));

  const togglePhrase = (phraseId: string) => {
    const numId = Number(phraseId);
    setConfig(prev => ({
      ...prev,
      excluded_phrase_ids: prev.excluded_phrase_ids.includes(numId)
        ? prev.excluded_phrase_ids.filter(id => id !== numId)
        : [...prev.excluded_phrase_ids, numId],
    }));
  };

  const toggleAll = (exclude: boolean) => {
    setConfig(prev => ({
      ...prev,
      excluded_phrase_ids: exclude ? phrases.map(p => Number(p.id)) : [],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(plan.id, config);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const activeCount = phrases.length - config.excluded_phrase_ids.filter(
    id => phrases.some(p => Number(p.id) === id)
  ).length;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />

      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Configuración del plan</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{plan.name}</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Sección: Comportamiento de sesión */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Comportamiento de sesión
            </h3>

            {/* Shuffle */}
            <label className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <Shuffle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Orden aleatorio</p>
                  <p className="text-xs text-muted-foreground">Mezcla las frases en cada sesión</p>
                </div>
              </div>
              <div
                onClick={() => setConfig(prev => ({ ...prev, shuffle: !prev.shuffle }))}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                  config.shuffle ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    config.shuffle ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </label>

            {/* Límite por sesión */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10">
                  <Hash className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Límite por sesión</p>
                  <p className="text-xs text-muted-foreground">Máximo de frases a repasar. Vacío = sin límite</p>
                </div>
              </div>
              <input
                type="number"
                min={1}
                placeholder="∞"
                value={config.daily_limit ?? ''}
                onChange={e => {
                  const val = e.target.value;
                  setConfig(prev => ({ ...prev, daily_limit: val === '' ? null : Number(val) }));
                }}
                className="w-20 rounded-lg border border-border bg-muted px-3 py-1.5 text-sm text-center text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </section>

          {/* Sección: Frases del plan */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Frases del plan
              </h3>
              {phrases.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {activeCount} activas de {phrases.length}
                  </span>
                  <button
                    onClick={() => toggleAll(false)}
                    className="text-xs text-primary hover:underline"
                  >
                    Activar todas
                  </button>
                  <button
                    onClick={() => toggleAll(true)}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Desactivar todas
                  </button>
                </div>
              )}
            </div>

            {loadingPhrases ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Cargando frases...</span>
              </div>
            ) : phrases.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No hay frases activas en este plan.
              </p>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                {phrases.map(phrase => {
                  const excluded = isExcluded(phrase.id);
                  const category = categories.find(c => c.id === phrase.categoryId);
                  const subcategory = category?.subcategories.find(s => s.id === phrase.subcategoryId);
                  return (
                    <label
                      key={phrase.id}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        excluded ? 'bg-muted/60 opacity-50' : 'bg-background hover:bg-muted/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!excluded}
                        onChange={() => togglePhrase(phrase.id)}
                        className="mt-0.5 h-4 w-4 rounded border-border accent-primary flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${excluded ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {phrase.text}
                        </p>
                        {(category || subcategory) && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {category?.name}{subcategory ? ` / ${subcategory.name}` : ''}
                          </p>
                        )}
                      </div>
                      {excluded && <EyeOff className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />}
                    </label>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar configuración
          </button>
        </div>
      </div>
    </div>
  );
}
