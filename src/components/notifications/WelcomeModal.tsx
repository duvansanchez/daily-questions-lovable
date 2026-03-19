import { useEffect, useState, useRef } from 'react';
import { X, Target, CalendarDays, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { goalsAPI } from '@/services/api';
import { shouldShowNotification, markNotificationShown, getGreeting } from './notificationState';

type GoalItem = { titulo: string; categoria: string; completado: boolean; fecha_inicio?: string | null; fecha_fin?: string | null };

const PREVIEW = 3;
const AUTO_DISMISS_MS = 20000;

function normalizeCategory(cat: string | null | undefined): string {
  const c = (cat ?? '').toLowerCase().trim();
  if (c === 'semanal' || c === 'semanales' || c === 'weekly') return 'weekly';
  if (c === 'mensual' || c === 'mensuales' || c === 'monthly') return 'monthly';
  return c;
}

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [weeklyGoals, setWeeklyGoals] = useState<GoalItem[]>([]);
  const [monthlyGoals, setMonthlyGoals] = useState<GoalItem[]>([]);
  const [expandedWeekly, setExpandedWeekly] = useState(false);
  const [expandedMonthly, setExpandedMonthly] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!shouldShowNotification()) return;
    fetchData();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const fetchData = async () => {
    try {
      const goalsRes = await goalsAPI.getGoals(1, 100);
      const goals: GoalItem[] = goalsRes.items;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const isVigente = (g: GoalItem) => {
        if (g.fecha_inicio) {
          const inicio = new Date(g.fecha_inicio);
          inicio.setHours(0, 0, 0, 0);
          if (inicio > today) return false;
        }
        if (g.fecha_fin) {
          const fin = new Date(g.fecha_fin);
          fin.setHours(23, 59, 59, 999);
          if (fin < today) return false;
        }
        return true;
      };

      const weekly = goals.filter(g => normalizeCategory(g.categoria) === 'weekly' && !g.completado && isVigente(g));
      const monthly = goals.filter(g => normalizeCategory(g.categoria) === 'monthly' && !g.completado && isVigente(g));

      setWeeklyGoals(weekly);
      setMonthlyGoals(monthly);

      if (weekly.length > 0 || monthly.length > 0) {
        setVisible(true);
        timerRef.current = setTimeout(() => dismiss(), AUTO_DISMISS_MS);
      } else {
        markNotificationShown();
      }
    } catch (err) {
      console.error('Error fetching welcome data:', err);
    }
  };

  const dismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
      markNotificationShown();
    }, 300);
  };

  if (!visible) return null;

  const total = weeklyGoals.length + monthlyGoals.length;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center transition-opacity duration-300 ${
        exiting ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ animation: exiting ? undefined : 'fadeIn 0.3s ease-out' }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismiss} />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: exiting ? undefined : 'scaleIn 0.3s ease-out' }}
      >
        {/* Barra de progreso auto-cierre */}
        <div className="h-1 bg-muted overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-primary"
            style={{ animation: `shrink ${AUTO_DISMISS_MS}ms linear forwards` }}
          />
        </div>

      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-foreground leading-tight">{getGreeting()}</p>
          <p className="text-sm text-muted-foreground">
            Tienes <span className="font-semibold text-primary">{total}</span> objetivo{total !== 1 ? 's' : ''} pendiente{total !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={dismiss}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Lista de objetivos */}
      <div className="px-6 pb-6 space-y-3">
        {weeklyGoals.length > 0 && (
          <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                  Semanales · {weeklyGoals.length}
                </span>
              </div>
              {weeklyGoals.length > PREVIEW && (
                <button
                  onClick={() => setExpandedWeekly(v => !v)}
                  className="flex items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400 hover:underline"
                >
                  {expandedWeekly ? (
                    <><ChevronUp className="h-3.5 w-3.5" /> Ver menos</>
                  ) : (
                    <><ChevronDown className="h-3.5 w-3.5" /> Ver más</>
                  )}
                </button>
              )}
            </div>
            <ul className="space-y-1">
              {(expandedWeekly ? weeklyGoals : weeklyGoals.slice(0, PREVIEW)).map((g, i) => (
                <li key={i} className="text-sm text-foreground">• {g.titulo}</li>
              ))}
              {!expandedWeekly && weeklyGoals.length > PREVIEW && (
                <li
                  className="text-sm text-amber-600 dark:text-amber-400 cursor-pointer hover:underline"
                  onClick={() => setExpandedWeekly(true)}
                >
                  +{weeklyGoals.length - PREVIEW} más — Ver todos
                </li>
              )}
            </ul>
          </div>
        )}

        {monthlyGoals.length > 0 && (
          <div className="bg-indigo-500/8 border border-indigo-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-indigo-500" />
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                  Mensuales · {monthlyGoals.length}
                </span>
              </div>
              {monthlyGoals.length > PREVIEW && (
                <button
                  onClick={() => setExpandedMonthly(v => !v)}
                  className="flex items-center gap-0.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {expandedMonthly ? (
                    <><ChevronUp className="h-3.5 w-3.5" /> Ver menos</>
                  ) : (
                    <><ChevronDown className="h-3.5 w-3.5" /> Ver más</>
                  )}
                </button>
              )}
            </div>
            <ul className="space-y-1">
              {(expandedMonthly ? monthlyGoals : monthlyGoals.slice(0, PREVIEW)).map((g, i) => (
                <li key={i} className="text-sm text-foreground">• {g.titulo}</li>
              ))}
              {!expandedMonthly && monthlyGoals.length > PREVIEW && (
                <li
                  className="text-sm text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline"
                  onClick={() => setExpandedMonthly(true)}
                >
                  +{monthlyGoals.length - PREVIEW} más — Ver todos
                </li>
              )}
            </ul>
          </div>
        )}

        <button
          onClick={dismiss}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Vamos a ello
        </button>
      </div>
      </div>
    </div>
  );
}
