import { useEffect, useState, useRef } from 'react';
import { X, Target, CalendarDays, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { goalsAPI } from '@/services/api';
import { shouldShowNotification, markNotificationShown, getGreeting } from './notificationState';

type GoalItem = { titulo: string; categoria: string; completado: boolean };

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
      const weekly = goals.filter(g => normalizeCategory(g.categoria) === 'weekly' && !g.completado);
      const monthly = goals.filter(g => normalizeCategory(g.categoria) === 'monthly' && !g.completado);

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
      className={`fixed bottom-6 right-6 z-[200] w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
        exiting ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}
      style={{ animation: exiting ? undefined : 'slideInRight 0.35s ease-out' }}
    >
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Barra de progreso auto-cierre */}
      <div className="h-1 bg-muted overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-primary"
          style={{ animation: `shrink ${AUTO_DISMISS_MS}ms linear forwards` }}
        />
      </div>
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 flex-shrink-0">
          <Bell className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">{getGreeting()}</p>
          <p className="text-xs text-muted-foreground">
            Tienes <span className="font-semibold text-primary">{total}</span> objetivo{total !== 1 ? 's' : ''} pendiente{total !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={dismiss}
          className="p-1 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Lista de objetivos */}
      <div className="px-4 pb-4 space-y-2">
        {weeklyGoals.length > 0 && (
          <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                  Semanales · {weeklyGoals.length}
                </span>
              </div>
              {weeklyGoals.length > PREVIEW && (
                <button
                  onClick={() => setExpandedWeekly(v => !v)}
                  className="flex items-center gap-0.5 text-[11px] text-amber-600 dark:text-amber-400 hover:underline"
                >
                  {expandedWeekly ? (
                    <><ChevronUp className="h-3 w-3" /> Ver menos</>
                  ) : (
                    <><ChevronDown className="h-3 w-3" /> Ver más</>
                  )}
                </button>
              )}
            </div>
            <ul className="space-y-0.5">
              {(expandedWeekly ? weeklyGoals : weeklyGoals.slice(0, PREVIEW)).map((g, i) => (
                <li key={i} className="text-xs text-foreground truncate">• {g.titulo}</li>
              ))}
              {!expandedWeekly && weeklyGoals.length > PREVIEW && (
                <li
                  className="text-xs text-amber-600 dark:text-amber-400 cursor-pointer hover:underline"
                  onClick={() => setExpandedWeekly(true)}
                >
                  +{weeklyGoals.length - PREVIEW} más — Ver todos
                </li>
              )}
            </ul>
          </div>
        )}

        {monthlyGoals.length > 0 && (
          <div className="bg-indigo-500/8 border border-indigo-500/20 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-indigo-500" />
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                  Mensuales · {monthlyGoals.length}
                </span>
              </div>
              {monthlyGoals.length > PREVIEW && (
                <button
                  onClick={() => setExpandedMonthly(v => !v)}
                  className="flex items-center gap-0.5 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {expandedMonthly ? (
                    <><ChevronUp className="h-3 w-3" /> Ver menos</>
                  ) : (
                    <><ChevronDown className="h-3 w-3" /> Ver más</>
                  )}
                </button>
              )}
            </div>
            <ul className="space-y-0.5">
              {(expandedMonthly ? monthlyGoals : monthlyGoals.slice(0, PREVIEW)).map((g, i) => (
                <li key={i} className="text-xs text-foreground truncate">• {g.titulo}</li>
              ))}
              {!expandedMonthly && monthlyGoals.length > PREVIEW && (
                <li
                  className="text-xs text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline"
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
          className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          Vamos a ello
        </button>
      </div>
    </div>
  );
}
