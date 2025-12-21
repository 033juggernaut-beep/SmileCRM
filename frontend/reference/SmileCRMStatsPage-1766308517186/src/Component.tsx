/**
 * SmileCRM Statistics Page
 * 
 * A comprehensive statistics dashboard for the dental CRM web application.
 * Features:
 * - Fixed header with logo, language switcher, notifications, theme toggle
 * - General clinic metrics (Total, Active, VIP)
 * - Visit statistics with period toggle
 * - Financial overview
 * - Visit dynamics chart
 * - Footer with links
 * - Medical blue color palette matching SmileCRMBlueDashboard
 * - Desktop-first responsive layout with dark mode support
 */

import React, { useState } from 'react';
import { 
  Users, 
  Activity, 
  Calendar, 
  TrendingUp, 
  Wallet, 
  Bell,
  Moon,
  Sun,
  Crown,
  TrendingDown,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Tooth Logo Icon (outline style from SmileCRMBlueDashboard) ---
const ToothLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2C9.5 2 7.5 3 6.5 4.5C5.5 6 5 8 5 10C5 12 5.5 14 6 16C6.5 18 7 20 8 21.5C8.5 22 9 22 9.5 21.5C10.5 20 11 18 11 16C11 15 11.5 14 12 14C12.5 14 13 15 13 16C13 18 13.5 20 14.5 21.5C15 22 15.5 22 16 21.5C17 20 17.5 18 18 16C18.5 14 19 12 19 10C19 8 18.5 6 17.5 4.5C16.5 3 14.5 2 12 2Z" />
  </svg>
);

// --- Background Pattern (dental pattern) ---
const BackgroundPattern = ({ isDark }: { isDark: boolean }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <svg className="absolute w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="tooth-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <path 
            d="M50 10C45 10 41 12 39 16C37 20 36 24 36 28C36 32 37 36 38 40C39 44 40 48 42 50C42.5 50.5 43 50 43.5 49C44 48 44.5 46 45 44C45.5 42 46 41 46 41C46 41 46.5 42 47 44C47.5 46 48 48 48.5 49C49 50 49.5 50.5 50 50C51 48 51.5 44 52 40C52.5 36 53 32 53 28C53 24 52.5 20 50.5 16C48.5 12 55 10 50 10Z" 
            fill={isDark ? '#60a5fa' : '#3b82f6'}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#tooth-pattern)" />
    </svg>
  </div>
);

// --- Props ---
export interface SmileCRMStatsPageProps {
  onBack?: () => void;
  className?: string;
  initialPeriod?: '7d' | '30d';
  initialTheme?: 'light' | 'dark';
  onThemeToggle?: () => void;
}

// --- Language type ---
type Language = 'AM' | 'RU' | 'EN';

// --- Sub-components ---

interface SectionProps {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  delay?: number;
  isDark: boolean;
}

const Section = ({ title, icon: Icon, children, delay = 0, isDark }: SectionProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="mb-8"
  >
    <div className="flex items-center gap-2 mb-4 px-1">
      {Icon && <Icon className={cn("w-4 h-4", isDark ? "text-blue-400" : "text-blue-600")} />}
      <h3 className={cn(
        "text-sm font-semibold uppercase tracking-wider",
        isDark ? "text-slate-400" : "text-slate-500"
      )}>{title}</h3>
    </div>
    {children}
  </motion.div>
);

interface StatCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isDark: boolean;
}

const StatCard = ({ children, className, onClick, isDark }: StatCardProps) => (
  <div 
    onClick={onClick}
    className={cn(
      "rounded-xl p-5 relative overflow-hidden transition-all duration-200",
      isDark 
        ? "bg-slate-800/70 border border-slate-700/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10" 
        : "bg-white border border-blue-100 shadow-md shadow-blue-50 hover:shadow-lg hover:shadow-blue-100 hover:border-blue-400",
      onClick && "cursor-pointer active:scale-[0.99]",
      className
    )}
  >
    {children}
  </div>
);

// --- Chart Component ---
const SimpleLineChart = ({ period, isDark }: { period: '7d' | '30d'; isDark: boolean }) => {
  const data = period === '7d' 
    ? [12, 18, 15, 22, 28, 24, 32] 
    : [15, 18, 12, 15, 18, 22, 20, 25, 28, 30, 28, 25, 22, 20, 18, 22, 25, 28, 32, 35, 30, 28, 32, 35, 38, 40, 38, 35, 32, 36];
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 120;
  const width = 100;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height * 0.7) - (height * 0.15);
    return `${x},${y}`;
  }).join(' ');

  const strokeColor = isDark ? '#60a5fa' : '#3b82f6';
  const gradientStart = isDark ? 'rgba(96, 165, 250, 0.25)' : 'rgba(59, 130, 246, 0.25)';

  return (
    <div className="w-full h-[120px] relative mt-6 mb-2">
      <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradientBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientStart} stopOpacity="1" />
            <stop offset="100%" stopColor={gradientStart} stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d={`M0,${height} L${points.split(' ')[0]} ${points} L${width},${height} Z`}
          fill="url(#chartGradientBlue)"
        />

        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          d={`M${points.split(' ').join(' L')}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        
        {points.split(' ').length > 0 && (
          <circle 
            cx={points.split(' ').slice(-1)[0].split(',')[0]} 
            cy={points.split(' ').slice(-1)[0].split(',')[1]} 
            r="3" 
            className={cn(
              "stroke-[2.5]",
              isDark ? "fill-slate-900 stroke-blue-400" : "fill-white stroke-blue-600"
            )}
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      
      <div className={cn(
        "flex justify-between mt-2 text-[10px] font-medium uppercase",
        isDark ? "text-slate-500" : "text-slate-400"
      )}>
        <span>{period === '7d' ? '7 дней назад' : '30 дней назад'}</span>
        <span>Сегодня</span>
      </div>
    </div>
  );
};

// --- Language Switcher ---
const LanguageSwitcher = ({ isDark }: { isDark: boolean }) => {
  const [lang, setLang] = useState<Language>('RU');
  const languages: Language[] = ['AM', 'RU', 'EN'];
  
  return (
    <div className="flex items-center text-sm">
      {languages.map((l, index) => (
        <span key={l} className="flex items-center">
          <button 
            onClick={() => setLang(l)}
            className={cn(
              "px-1.5 py-0.5 transition-colors duration-200 font-medium",
              lang === l 
                ? (isDark ? "text-blue-400" : "text-blue-600")
                : (isDark ? "text-slate-500" : "text-slate-400")
            )}
          >
            {l}
          </button>
          {index < languages.length - 1 && (
            <span className={isDark ? "text-slate-600 mx-1" : "text-slate-300 mx-1"}>|</span>
          )}
        </span>
      ))}
    </div>
  );
};

// --- Main Component ---
export function SmileCRMStatsPage({ 
  onBack, 
  className, 
  initialPeriod = '7d', 
  initialTheme = 'light', 
  onThemeToggle 
}: SmileCRMStatsPageProps) {
  const [period, setPeriod] = useState<'7d' | '30d'>(initialPeriod);
  const [isDark, setIsDark] = useState(initialTheme === 'dark');

  const handleThemeToggle = () => {
    setIsDark(!isDark);
    onThemeToggle?.();
  };

  return (
    <div className={cn(
      "min-h-screen w-full relative transition-colors duration-300 font-sans",
      isDark 
        ? "bg-slate-900" 
        : "bg-gradient-to-br from-slate-50 via-blue-50/30 to-sky-50/50",
      className
    )}>
      {/* Background Pattern */}
      <BackgroundPattern isDark={isDark} />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Header */}
        <header className={cn(
          "w-full px-6 py-4 flex items-center justify-between border-b transition-colors duration-300",
          isDark 
            ? "bg-slate-900/80 border-slate-700/50" 
            : "bg-white/90 border-blue-100"
        )}>
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <ToothLogo className={cn("w-7 h-7", isDark ? "text-blue-400" : "text-blue-600")} />
            <span className={cn(
              "text-lg font-semibold tracking-wide",
              isDark ? "text-white" : "text-slate-800"
            )}>
              SmileCRM
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-5">
            <LanguageSwitcher isDark={isDark} />
            
            <div className="relative">
              <Bell className={cn("w-5 h-5", isDark ? "text-slate-400" : "text-slate-500")} />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-500 rounded-full text-[10px] flex items-center justify-center text-white font-semibold">
                3
              </span>
            </div>
            
            <button 
              onClick={handleThemeToggle}
              className={isDark ? "text-slate-400" : "text-slate-500"}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Content */}
        <motion.main 
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="flex-1 flex flex-col items-center justify-start px-4 py-8 md:py-12 gap-8 md:gap-10"
        >
          <div className="w-full max-w-3xl mx-auto px-2">
            
            {/* Back Button in Body - aligned with content */}
            {onBack && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                onClick={onBack}
                className={cn(
                  "flex items-center gap-1 mb-4 text-sm font-medium transition-all duration-200 group",
                  isDark 
                    ? "text-slate-400 hover:text-blue-400" 
                    : "text-slate-500 hover:text-blue-600"
                )}
              >
                <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span>Назад</span>
              </motion.button>
            )}
            
            {/* Page Title */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={cn(
                "w-full px-8 py-10 rounded-2xl transition-colors duration-300 mb-10",
                isDark 
                  ? "bg-slate-800/60 shadow-xl shadow-slate-900/30" 
                  : "bg-gradient-to-br from-blue-50 to-sky-50 shadow-lg shadow-blue-100/50"
              )}
            >
              <h1 className={cn(
                "text-3xl md:text-4xl font-semibold tracking-tight text-center",
                isDark ? "text-white" : "text-slate-800"
              )}>
                Статистика клиники
              </h1>
              <p className={cn(
                "mt-3 text-base md:text-lg text-center font-normal",
                isDark ? "text-slate-400" : "text-slate-500"
              )}>
                Обзор ключевых показателей
              </p>
            </motion.div>

            {/* Stats Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl mx-auto">
              
              {/* Left Column */}
              <div>
                {/* Section 1: General Metrics */}
                <Section title="Общие показатели" icon={Activity} delay={0.1} isDark={isDark}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <StatCard isDark={isDark}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          isDark ? "bg-blue-500/15" : "bg-blue-100"
                        )}>
                          <Users className={cn("w-5 h-5", isDark ? "text-blue-400" : "text-blue-600")} />
                        </div>
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded-full",
                          isDark ? "text-blue-400 bg-blue-500/15" : "text-blue-600 bg-blue-500/10"
                        )}>Всего</span>
                      </div>
                      <div className="space-y-1">
                        <div className={cn("text-sm font-medium", isDark ? "text-slate-400" : "text-slate-500")}>Пациентов</div>
                        <div className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-800")}>1,247</div>
                      </div>
                    </StatCard>
                    
                    <StatCard isDark={isDark}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          isDark ? "bg-emerald-500/15" : "bg-emerald-100"
                        )}>
                          <Activity className={cn("w-5 h-5", isDark ? "text-emerald-400" : "text-emerald-600")} />
                        </div>
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded-full",
                          isDark ? "text-emerald-400 bg-emerald-500/15" : "text-emerald-600 bg-emerald-500/10"
                        )}>+8%</span>
                      </div>
                      <div className="space-y-1">
                        <div className={cn("text-sm font-medium", isDark ? "text-slate-400" : "text-slate-500")}>Активных</div>
                        <div className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-800")}>854</div>
                      </div>
                    </StatCard>
                    
                    <StatCard isDark={isDark}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          isDark ? "bg-amber-500/15" : "bg-amber-100"
                        )}>
                          <Crown className={cn("w-5 h-5", isDark ? "text-amber-400" : "text-amber-600")} />
                        </div>
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded-full",
                          isDark ? "text-amber-400 bg-amber-500/15" : "text-amber-600 bg-amber-500/10"
                        )}>VIP</span>
                      </div>
                      <div className="space-y-1">
                        <div className={cn("text-sm font-medium", isDark ? "text-slate-400" : "text-slate-500")}>VIP пациентов</div>
                        <div className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-800")}>87</div>
                      </div>
                    </StatCard>
                  </div>
                </Section>

                {/* Section 2: Finance */}
                <Section title="Финансы" icon={Wallet} delay={0.2} isDark={isDark}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <StatCard isDark={isDark}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          isDark ? "bg-emerald-500/15" : "bg-emerald-100"
                        )}>
                          <Wallet className={cn("w-5 h-5", isDark ? "text-emerald-400" : "text-emerald-600")} />
                        </div>
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded-full",
                          isDark ? "text-emerald-400 bg-emerald-500/15" : "text-emerald-600 bg-emerald-500/10"
                        )}>+12%</span>
                      </div>
                      <div className="space-y-1">
                        <div className={cn("text-sm font-medium", isDark ? "text-slate-400" : "text-slate-500")}>Доход за сегодня</div>
                        <div className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-800")}>42,500 ₽</div>
                      </div>
                    </StatCard>
                    
                    <StatCard isDark={isDark}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          isDark ? "bg-blue-500/15" : "bg-blue-100"
                        )}>
                          <TrendingUp className={cn("w-5 h-5", isDark ? "text-blue-400" : "text-blue-600")} />
                        </div>
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded-full",
                          isDark ? "text-slate-400 bg-slate-700" : "text-slate-500 bg-slate-100"
                        )}>Месяц</span>
                      </div>
                      <div className="space-y-1">
                        <div className={cn("text-sm font-medium", isDark ? "text-slate-400" : "text-slate-500")}>Доход за месяц</div>
                        <div className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-800")}>1.24 M ₽</div>
                      </div>
                    </StatCard>
                    
                    <StatCard isDark={isDark}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          isDark ? "bg-red-500/15" : "bg-red-100"
                        )}>
                          <TrendingDown className={cn("w-5 h-5", isDark ? "text-red-400" : "text-red-600")} />
                        </div>
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded-full",
                          isDark ? "text-red-400 bg-red-500/15" : "text-red-600 bg-red-500/10"
                        )}>-3%</span>
                      </div>
                      <div className="space-y-1">
                        <div className={cn("text-sm font-medium", isDark ? "text-slate-400" : "text-slate-500")}>Расходы за месяц</div>
                        <div className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-800")}>486,200 ₽</div>
                      </div>
                    </StatCard>
                  </div>
                </Section>
              </div>

              {/* Right Column */}
              <div>
                {/* Section 3: Visits */}
                <Section title="Визиты" icon={Calendar} delay={0.3} isDark={isDark}>
                  <StatCard isDark={isDark} className="overflow-visible">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className={cn(
                          "text-3xl font-bold tracking-tight",
                          isDark ? "text-white" : "text-slate-800"
                        )}>
                          {period === '7d' ? '84' : '345'}
                        </div>
                        <div className={cn(
                          "text-xs font-medium mt-1",
                          isDark ? "text-slate-400" : "text-slate-500"
                        )}>
                          Общее количество визитов
                        </div>
                      </div>
                      
                      <div className={cn(
                        "flex p-1 rounded-lg",
                        isDark ? "bg-slate-700/50" : "bg-slate-100"
                      )}>
                        {(['7d', '30d'] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={cn(
                              "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                              period === p 
                                ? (isDark 
                                    ? "bg-slate-800 text-white shadow-sm ring-1 ring-slate-600" 
                                    : "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200")
                                : (isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800")
                            )}
                          >
                            {p === '7d' ? '7 дн.' : '30 дн.'}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-4 mb-4">
                      <div className={cn(
                        "flex items-center justify-between py-2 border-b",
                        isDark ? "border-slate-700/50" : "border-slate-100"
                      )}>
                        <span className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Сегодня визитов</span>
                        <span className={cn("text-sm font-semibold", isDark ? "text-white" : "text-slate-800")}>14</span>
                      </div>
                      <div className={cn(
                        "flex items-center justify-between py-2 border-b",
                        isDark ? "border-slate-700/50" : "border-slate-100"
                      )}>
                        <span className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>За 7 дней</span>
                        <span className={cn("text-sm font-semibold", isDark ? "text-white" : "text-slate-800")}>84</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>За 30 дней</span>
                        <span className={cn("text-sm font-semibold", isDark ? "text-white" : "text-slate-800")}>345</span>
                      </div>
                    </div>
                  </StatCard>
                </Section>

                {/* Section 4: Dynamics Chart */}
                <Section title="Динамика визитов" icon={TrendingUp} delay={0.4} isDark={isDark}>
                  <StatCard isDark={isDark} className="overflow-visible">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className={cn(
                          "text-3xl font-bold tracking-tight",
                          isDark ? "text-white" : "text-slate-800"
                        )}>
                          {period === '7d' ? '84' : '345'}
                        </div>
                        <div className={cn(
                          "text-xs font-medium mt-1",
                          isDark ? "text-slate-400" : "text-slate-500"
                        )}>
                          Визиты за период
                        </div>
                      </div>
                      
                      <div className={cn(
                        "flex p-1 rounded-lg",
                        isDark ? "bg-slate-700/50" : "bg-slate-100"
                      )}>
                        {(['7d', '30d'] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={cn(
                              "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                              period === p 
                                ? (isDark 
                                    ? "bg-slate-800 text-white shadow-sm ring-1 ring-slate-600" 
                                    : "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200")
                                : (isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800")
                            )}
                          >
                            {p === '7d' ? '7 дн.' : '30 дн.'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <SimpleLineChart period={period} isDark={isDark} />
                  </StatCard>
                </Section>
              </div>
            </div>
          </div>
        </motion.main>

        {/* Footer */}
        <footer className={cn(
          "w-full py-6 mt-auto",
          isDark ? "border-t border-slate-800" : "border-t border-blue-100/50"
        )}>
          <nav className="flex items-center justify-center gap-6 flex-wrap px-4">
            {[
              { label: 'Оплата', href: '#payment' },
              { label: 'Помощь', href: '#help' },
              { label: 'Политика конфиденциальности', href: '#privacy' },
            ].map((link, index) => (
              <a
                key={index}
                href={link.href}
                className={cn(
                  "text-xs font-normal transition-all duration-200 hover:underline underline-offset-2",
                  isDark 
                    ? "text-slate-500 hover:text-slate-400" 
                    : "text-slate-400 hover:text-slate-500"
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </footer>
      </div>
    </div>
  );
}

export default SmileCRMStatsPage;
