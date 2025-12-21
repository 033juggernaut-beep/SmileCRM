/**
 * Page title section
 * - Optional back button for inner pages
 * - Main title
 * - Optional subtitle
 * - Clean spacing
 */

import { BackButton } from './BackButton';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  isDark: boolean;
  showBackButton?: boolean;
  backLabel?: string;
  onBack?: () => void;
}

export function PageTitle({
  title,
  subtitle,
  isDark,
  showBackButton = false,
  backLabel = 'Назад',
  onBack,
}: PageTitleProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 pt-4 pb-4">
      {/* Back Button */}
      {showBackButton && (
        <div className="mb-3">
          <BackButton label={backLabel} onClick={onBack} isDark={isDark} />
        </div>
      )}

      <h1
        className={`text-2xl font-semibold tracking-tight ${
          isDark ? 'text-white' : 'text-slate-800'
        }`}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          className={`text-sm mt-1 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
