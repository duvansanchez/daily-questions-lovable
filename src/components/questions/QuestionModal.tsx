import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X, Plus } from 'lucide-react';
import type { Question, QuestionType, QuestionCategory, QuestionOption } from '@/types';

interface QuestionFormData {
  title: string;
  description: string;
  type: QuestionType;
  category: QuestionCategory;
  required: boolean;
  active: boolean;
  options: QuestionOption[];
}

const defaultForm: QuestionFormData = {
  title: '',
  description: '',
  type: 'text',
  category: 'personal',
  required: false,
  active: true,
  options: [],
};

interface QuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: Question | null;
  onSave: (data: QuestionFormData) => void;
}

export default function QuestionModal({ open, onOpenChange, question, onSave }: QuestionModalProps) {
  const isEditing = !!question;
  const [form, setForm] = useState<QuestionFormData>(defaultForm);
  const [newOptionLabel, setNewOptionLabel] = useState('');

  useEffect(() => {
    if (question) {
      setForm({
        title: question.title,
        description: question.description || '',
        type: question.type,
        category: question.category,
        required: question.required,
        active: question.active,
        options: question.options ? [...question.options] : [],
      });
    } else {
      setForm(defaultForm);
    }
    setNewOptionLabel('');
  }, [question, open]);

  const update = <K extends keyof QuestionFormData>(key: K, value: QuestionFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const needsOptions = form.type === 'select' || form.type === 'radio' || form.type === 'checkbox';

  const addOption = () => {
    if (!newOptionLabel.trim()) return;
    const newOption: QuestionOption = {
      id: `opt-${Date.now()}`,
      value: newOptionLabel.toLowerCase().replace(/\s+/g, '-'),
      label: newOptionLabel.trim(),
      order: form.options.length + 1,
    };
    update('options', [...form.options, newOption]);
    setNewOptionLabel('');
  };

  const removeOption = (id: string) => {
    update('options', form.options.filter(o => o.id !== id));
  };

  const updateOptionLabel = (id: string, label: string) => {
    update('options', form.options.map(o =>
      o.id === id ? { ...o, label, value: label.toLowerCase().replace(/\s+/g, '-') } : o
    ));
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    if (needsOptions && form.options.length === 0) {
      alert('Debes agregar al menos una opción para este tipo de pregunta');
      return;
    }
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-border bg-background text-foreground p-0 gap-0 sm:rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-primary px-6 pt-5 pb-4 rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-heading font-bold text-primary-foreground">
              {isEditing ? 'Editar Pregunta' : 'Nueva Pregunta'}
            </DialogTitle>
            <DialogDescription className="text-xs text-primary-foreground/75 mt-1">
              {isEditing
                ? 'Modifica los campos que desees y guarda los cambios.'
                : 'Completa los campos para crear una nueva pregunta.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Pregunta */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-primary">
              Pregunta
            </label>
            <textarea
              value={form.title}
              onChange={e => update('title', e.target.value)}
              placeholder="Escribe la pregunta aquí..."
              className="w-full min-h-[80px] px-4 py-3 rounded-lg border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-y"
              maxLength={500}
            />
          </div>

          {/* Descripción (opcional) */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-primary">
              Descripción (opcional)
            </label>
            <textarea
              value={form.description}
              onChange={e => update('description', e.target.value)}
              placeholder="Añade una descripción o instrucciones adicionales..."
              className="w-full min-h-[70px] px-4 py-3 rounded-lg border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-y"
              maxLength={500}
            />
          </div>

          {/* Tipo de Pregunta */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-primary">
              Tipo de Pregunta
            </label>
            <select
              value={form.type}
              onChange={e => {
                update('type', e.target.value as QuestionType);
                // Limpiar opciones si cambia a tipo texto
                if (e.target.value === 'text') {
                  update('options', []);
                }
              }}
              className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="text">📝 Texto libre</option>
              <option value="select">📋 Selección única (dropdown)</option>
              <option value="radio">⚪ Opción única (radio)</option>
              <option value="checkbox">☑️ Múltiple selección (checkbox)</option>
            </select>
          </div>

          {/* Opciones (solo si el tipo lo requiere) */}
          {needsOptions && (
            <div className="border-2 border-primary/20 rounded-xl p-4 bg-primary/5">
              <label className="block mb-3 text-sm font-semibold text-primary">
                Opciones de Respuesta
              </label>
              
              {form.options.length > 0 && (
                <div className="space-y-2 mb-3">
                  {form.options.map((option, index) => (
                    <div key={option.id} className="flex items-center gap-2 p-2 rounded-lg bg-background border border-input">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                        {index + 1}
                      </span>
                      <input
                        value={option.label}
                        onChange={e => updateOptionLabel(option.id, e.target.value)}
                        className="flex-1 text-sm text-foreground bg-transparent border-none outline-none focus:ring-0 px-1"
                        maxLength={100}
                      />
                      <button
                        onClick={() => removeOption(option.id)}
                        className="p-1 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  value={newOptionLabel}
                  onChange={e => setNewOptionLabel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addOption()}
                  placeholder="Nueva opción..."
                  className="flex-1 px-4 py-2 rounded-lg border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  maxLength={100}
                />
                <button
                  onClick={addOption}
                  disabled={!newOptionLabel.trim()}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Agregar
                </button>
              </div>
            </div>
          )}

          {/* Categoría */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-primary">
              Categoría
            </label>
            <select
              value={form.category}
              onChange={e => update('category', e.target.value as QuestionCategory)}
              className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="personal">👤 Personal</option>
              <option value="work">💼 Trabajo</option>
              <option value="health">💚 Salud</option>
              <option value="habits">🔄 Hábitos</option>
              <option value="goals">🎯 Objetivos</option>
              <option value="general">⭐ General</option>
            </select>
          </div>

          {/* Toggle: ¿Es obligatorio responder esta pregunta? */}
          <div className="flex items-center justify-between p-4 rounded-lg border-2 border-input bg-background">
            <div>
              <label className="text-sm font-semibold text-primary block mb-1">
                ¿Es obligatorio responder esta pregunta?
              </label>
              <p className="text-xs text-muted-foreground">
                Las preguntas obligatorias deben ser respondidas para completar el día
              </p>
            </div>
            <button
              onClick={() => update('required', !form.required)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                form.required ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  form.required ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Toggle: Pregunta activa */}
          <div className="flex items-center justify-between p-4 rounded-lg border-2 border-input bg-background">
            <div>
              <label className="text-sm font-semibold text-primary block mb-1">
                Pregunta activa
              </label>
              <p className="text-xs text-muted-foreground">
                Solo las preguntas activas aparecerán en las preguntas diarias
              </p>
            </div>
            <button
              onClick={() => update('active', !form.active)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                form.active ? 'bg-success' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  form.active ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-border bg-background px-6 py-4 rounded-b-2xl">
          <button
            onClick={() => onOpenChange(false)}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.title.trim()}
            className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isEditing ? 'Guardar Cambios' : 'Crear Pregunta'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
