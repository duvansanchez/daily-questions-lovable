import { useState } from 'react';
import { CheckCircle2, Clock, Save } from 'lucide-react';
import { mockQuestions } from '@/data/mockData';
import type { Question, QuestionResponse } from '@/types';

export default function QuestionsAnswer() {
  const activeQuestions = mockQuestions.filter(q => q.active).sort((a, b) => a.order - b.order);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [saved, setSaved] = useState(false);

  const today = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const answeredCount = Object.keys(responses).length;
  const totalCount = activeQuestions.length;
  const progress = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;

  const handleResponse = (questionId: string, value: string | string[]) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // Aquí se guardarían las respuestas en el backend
    console.log('Guardando respuestas:', responses);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground mb-1">
                Preguntas del Día
              </h1>
              <p className="text-sm text-muted-foreground capitalize">{today}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-semibold">{answeredCount}/{totalCount}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {activeQuestions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index + 1}
              value={responses[question.id]}
              onChange={(value) => handleResponse(question.id, value)}
            />
          ))}
        </div>

        {/* Save button */}
        {answeredCount > 0 && (
          <div className="sticky bottom-6 flex justify-center">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all ${
                saved 
                  ? 'bg-success hover:bg-success/90' 
                  : 'bg-primary hover:bg-primary/90 hover:scale-105'
              }`}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Guardado
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Guardar Respuestas
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionCard({ 
  question, 
  index, 
  value, 
  onChange 
}: { 
  question: Question; 
  index: number; 
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
}) {
  const isAnswered = value !== undefined && (Array.isArray(value) ? value.length > 0 : value !== '');

  return (
    <div className={`bg-card rounded-xl p-6 border transition-all ${
      isAnswered ? 'border-primary/50 shadow-sm' : 'border-border'
    }`}>
      {/* Question header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          isAnswered ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}>
          {index}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-foreground mb-1">
            {question.title}
            {question.required && <span className="text-destructive ml-1">*</span>}
          </h3>
          {question.description && (
            <p className="text-sm text-muted-foreground">{question.description}</p>
          )}
        </div>
      </div>

      {/* Question input */}
      <div className="ml-11">
        {question.type === 'text' && (
          <textarea
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Escribe tu respuesta..."
            className="w-full min-h-[100px] px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
            maxLength={500}
          />
        )}

        {question.type === 'select' && (
          <select
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Selecciona una opción...</option>
            {question.options?.map(opt => (
              <option key={opt.id} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}

        {question.type === 'radio' && (
          <div className="space-y-2">
            {question.options?.map(opt => (
              <label
                key={opt.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-input hover:bg-accent cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={opt.value}
                  checked={(value as string) === opt.value}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary/50"
                />
                <span className="text-sm text-foreground">{opt.label}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'checkbox' && (
          <div className="space-y-2">
            {question.options?.map(opt => {
              const selectedValues = (value as string[]) || [];
              const isChecked = selectedValues.includes(opt.value);
              
              return (
                <label
                  key={opt.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-input hover:bg-accent cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    value={opt.value}
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange([...selectedValues, opt.value]);
                      } else {
                        onChange(selectedValues.filter(v => v !== opt.value));
                      }
                    }}
                    className="h-4 w-4 rounded text-primary focus:ring-2 focus:ring-primary/50"
                  />
                  <span className="text-sm text-foreground">{opt.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
