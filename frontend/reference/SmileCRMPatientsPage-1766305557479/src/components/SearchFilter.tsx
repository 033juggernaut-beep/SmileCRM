/**
 * Search and filter bar for patients list
 * - Search input with placeholder
 * - Status filter dropdown
 * - Segment filter dropdown (Все / Только VIP)
 * - Minimal borders, soft blue focus
 */

import { Search } from 'lucide-react';
import type { SearchFilterProps, PatientStatus, SegmentFilter } from '../types';

const statusOptions: { value: 'all' | PatientStatus; label: string }[] = [
  { value: 'all', label: 'Все статусы' },
  { value: 'in_progress', label: 'В процессе' },
  { value: 'completed', label: 'Завершён' },
];

const segmentOptions: { value: SegmentFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'vip', label: 'Только VIP' },
];

export function SearchFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  segmentFilter,
  onSegmentFilterChange,
  isDark,
}: SearchFilterProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск по имени или телефону"
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none ${
              isDark
                ? 'bg-slate-800/70 border border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30'
                : 'bg-white border border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 shadow-sm'
            }`}
          />
        </div>

        {/* Segment Filter */}
        <select
          value={segmentFilter}
          onChange={(e) =>
            onSegmentFilterChange(e.target.value as SegmentFilter)
          }
          className={`px-4 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none cursor-pointer ${
            isDark
              ? 'bg-slate-800/70 border border-slate-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30'
              : 'bg-white border border-blue-100 text-slate-800 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 shadow-sm'
          }`}
        >
          {segmentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) =>
            onStatusFilterChange(e.target.value as 'all' | PatientStatus)
          }
          className={`px-4 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none cursor-pointer ${
            isDark
              ? 'bg-slate-800/70 border border-slate-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30'
              : 'bg-white border border-blue-100 text-slate-800 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 shadow-sm'
          }`}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
