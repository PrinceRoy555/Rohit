import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface CrmStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorScheme?: 'blue' | 'purple' | 'cyan' | 'indigo' | 'violet' | 'emerald' | 'amber' | 'pink';
  badgeType?: 'live' | 'action_req';
  trendText?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  sparklineData?: number[];
  sublabel?: string;
  actionText?: string;
  onAction?: () => void;
  onClick?: () => void;
}

export const CrmStatCard: React.FC<CrmStatCardProps> = ({
  title,
  value,
  icon: Icon,
  colorScheme = 'indigo',
  badgeType = 'live',
  trendText = '—',
  trendDirection = 'neutral',
  sparklineData,
  sublabel,
  actionText,
  onAction,
  onClick
}) => {
  const schemeStyles: Record<string, { iconBg: string; sparkStroke: string; sparkFill: string }> = {
    blue: {
      iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40',
      sparkStroke: '#6366f1',
      sparkFill: '#818cf8'
    },
    purple: {
      iconBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40',
      sparkStroke: '#8b5cf6',
      sparkFill: '#a78bfa'
    },
    cyan: {
      iconBg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40',
      sparkStroke: '#0ea5e9',
      sparkFill: '#38bdf8'
    },
    indigo: {
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40',
      sparkStroke: '#6366f1',
      sparkFill: '#818cf8'
    },
    violet: {
      iconBg: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/40',
      sparkStroke: '#8b5cf6',
      sparkFill: '#c084fc'
    },
    emerald: {
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40',
      sparkStroke: '#10b981',
      sparkFill: '#34d399'
    },
    amber: {
      iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40',
      sparkStroke: '#f59e0b',
      sparkFill: '#fbbf24'
    },
    pink: {
      iconBg: 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-900/40',
      sparkStroke: '#ec4899',
      sparkFill: '#f472b6'
    }
  };

  const scheme = schemeStyles[colorScheme] || schemeStyles.indigo;

  // Sparkline SVG coordinates
  const sparkWidth = 72;
  const sparkHeight = 24;

  // Generate smooth sparkline points
  const points: number[] = React.useMemo(() => {
    if (sparklineData && sparklineData.length >= 2 && sparklineData.some(v => v > 0)) {
      const min = Math.min(...sparklineData);
      const max = Math.max(...sparklineData);
      const range = max - min || 1;
      return sparklineData.map(v => 20 - ((v - min) / range) * 14);
    }
    // Default stylized curve matching direction
    if (trendDirection === 'up') {
      return [18, 14, 16, 11, 13, 6];
    }
    if (trendDirection === 'down') {
      return [7, 10, 8, 14, 12, 18];
    }
    return [13, 14, 13, 14, 13, 13];
  }, [sparklineData, trendDirection]);

  // Construct smooth bezier curve
  const sparklinePath = React.useMemo(() => {
    const stepX = sparkWidth / (points.length - 1);
    let d = `M 0 ${points[0]}`;
    for (let i = 0; i < points.length - 1; i++) {
      const x0 = i * stepX;
      const y0 = points[i];
      const x1 = (i + 1) * stepX;
      const y1 = points[i + 1];
      const cx = (x0 + x1) / 2;
      d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
    }
    return d;
  }, [points, sparkWidth]);

  const sparklineArea = `${sparklinePath} L ${sparkWidth} ${sparkHeight} L 0 ${sparkHeight} Z`;
  const gradId = `sparkGrad_${colorScheme}_${title.replace(/\s+/g, '')}`;

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-2xs hover:shadow-md hover:border-indigo-200 dark:hover:border-slate-700 ${
        onClick ? 'cursor-pointer active:scale-[0.99]' : ''
      }`}
    >
      {/* Top Row: Icon + Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${scheme.iconBg} transition-transform duration-200 group-hover:scale-105 shadow-2xs`}
        >
          <Icon className="w-4 h-4 stroke-[2.2]" />
        </div>

        {badgeType === 'action_req' ? (
          <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#8b5cf6] text-white shadow-2xs">
            ACTION REQ
          </span>
        ) : (
          <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#10b981] text-white shadow-2xs">
            LIVE
          </span>
        )}
      </div>

      {/* Title */}
      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        {title}
      </div>

      {/* Main Metric Value */}
      <div className="mt-1">
        <span className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          {value}
        </span>
      </div>

      {/* Bottom Row: Trend vs. 30 days on Left + Sparkline on Right */}
      <div className="flex items-end justify-between gap-2 mt-2 pt-1">
        {/* Trend */}
        <div className="flex items-center gap-1 text-[11px] font-bold">
          {trendDirection === 'up' && (
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          )}
          {trendDirection === 'down' && (
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          )}
          {trendDirection === 'neutral' && (
            <Minus className="w-3 h-3 text-slate-400 shrink-0" />
          )}

          <span
            className={
              trendDirection === 'down'
                ? 'text-rose-500'
                : trendDirection === 'up'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400'
            }
          >
            {trendText}
          </span>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate">
            vs. last 30 days
          </span>
        </div>

        {/* Mini SVG Sparkline */}
        <div className="w-[72px] h-[24px] shrink-0 overflow-hidden">
          <svg
            width={sparkWidth}
            height={sparkHeight}
            viewBox={`0 0 ${sparkWidth} ${sparkHeight}`}
            className="overflow-visible"
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={scheme.sparkFill} stopOpacity="0.28" />
                <stop offset="100%" stopColor={scheme.sparkFill} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Sparkline Area */}
            <path d={sparklineArea} fill={`url(#${gradId})`} />

            {/* Sparkline Stroke */}
            <path
              d={sparklinePath}
              fill="none"
              stroke={scheme.sparkStroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Sublabel & Action Link Row (Matches Approved Reference Image) */}
      {(sublabel || actionText) && (
        <div className="flex items-center justify-between text-[11px] pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-slate-400 dark:text-slate-500 font-medium truncate">
            {sublabel}
          </span>
          {actionText && (
            <button
              type="button"
              onClick={(e) => {
                if (onAction) {
                  e.stopPropagation();
                  onAction();
                }
              }}
              className="text-purple-600 dark:text-purple-400 font-bold hover:underline shrink-0 ml-1 cursor-pointer transition-colors"
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
