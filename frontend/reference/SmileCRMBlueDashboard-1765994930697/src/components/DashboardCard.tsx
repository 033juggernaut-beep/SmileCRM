/**
 * Dashboard action card with medical blue theme
 * - Fixed height for uniform 2x2 grid alignment
 * - Light blue / blue-gray surface
 * - Rounded corners
 * - Blue accent icons
 * - Subtle hover: blue outline, slight lift
 */

import { motion } from 'framer-motion';
import type { DashboardCardProps } from '../types';

interface ExtendedCardProps extends DashboardCardProps {
  isDark: boolean;
}

export function DashboardCard({
  icon,
  title,
  description,
  stats,
  onClick,
  isDark,
}: ExtendedCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className={`group w-full h-[180px] p-5 rounded-xl text-left transition-all duration-200 focus:outline-none flex flex-col ${
        isDark
          ? 'bg-slate-800/70 hover:border-blue-500/50 border border-slate-700/50 hover:shadow-lg hover:shadow-blue-500/10'
          : 'bg-white hover:border-blue-400 border border-blue-100 shadow-md shadow-blue-50 hover:shadow-lg hover:shadow-blue-100'
      }`}
    >
      {/* Icon Container */}
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
          isDark
            ? 'bg-blue-500/15 group-hover:bg-blue-500/25'
            : 'bg-blue-100 group-hover:bg-blue-200'
        }`}
      >
        <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>
          {icon}
        </span>
      </div>

      {/* Title */}
      <h3
        className={`text-base font-semibold mt-3 ${
          isDark ? 'text-white' : 'text-slate-800'
        }`}
      >
        {title}
      </h3>

      {/* Description or Stats */}
      {stats && stats.length > 0 ? (
        <div className="mt-auto pt-2 space-y-1">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <span
                className={`text-xs ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {stat.label}
              </span>
              <span
                className={`text-sm font-semibold ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p
          className={`text-sm font-normal mt-1 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {description}
        </p>
      )}
    </motion.button>
  );
}
