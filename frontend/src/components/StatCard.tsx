import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  colorTheme?: 'green' | 'blue' | 'yellow' | 'red' | 'slate';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  colorTheme = 'slate',
}) => {
  const themes = {
    green: 'border-l-4 border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10',
    blue: 'border-l-4 border-sky-500 bg-sky-50/30 dark:bg-sky-950/10',
    yellow: 'border-l-4 border-amber-500 bg-amber-50/30 dark:bg-amber-950/10',
    red: 'border-l-4 border-rose-500 bg-rose-50/30 dark:bg-rose-950/10',
    slate: 'border-l-4 border-slate-400 bg-slate-50/30 dark:bg-slate-900/10',
  };

  const textThemes = {
    green: 'text-emerald-600 dark:text-emerald-400',
    blue: 'text-sky-600 dark:text-sky-400',
    yellow: 'text-amber-600 dark:text-amber-400',
    red: 'text-rose-600 dark:text-rose-400',
    slate: 'text-slate-600 dark:text-slate-400',
  };

  return (
    <div className={`p-6 rounded-xl border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${themes[colorTheme]}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold tracking-wider uppercase text-slate-500">{title}</span>
        <div className={`p-2 rounded-lg bg-slate-100 ${textThemes[colorTheme]}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.type === 'positive'
                ? 'bg-emerald-100 text-emerald-800'
                : trend.type === 'negative'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-slate-100 text-slate-800'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-2 text-xs font-medium text-slate-500">{description}</p>
      )}
    </div>
  );
};
export default StatCard;
