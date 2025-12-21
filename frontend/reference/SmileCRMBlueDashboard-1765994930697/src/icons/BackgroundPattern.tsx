/**
 * Subtle dental background pattern
 * - Monochrome blue tone
 * - Very low opacity (4-6%)
 * - Clean and medical feel
 */

interface BackgroundPatternProps {
  isDark: boolean;
}

export function BackgroundPattern({ isDark }: BackgroundPatternProps) {
  const strokeColor = isDark ? '#60a5fa' : '#1e40af';
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Top left tooth */}
      <svg
        className="absolute -left-16 top-20 w-64 h-64 opacity-[0.04]"
        viewBox="0 0 100 100"
        fill="none"
        stroke={strokeColor}
        strokeWidth="0.8"
      >
        <path d="M50 10C40 10 32 15 28 22C24 29 22 38 22 48C22 58 24 68 28 78C32 88 36 95 42 98C44 99 46 98 48 95C52 88 54 78 54 68C54 63 56 58 50 58C44 58 46 63 46 68C46 78 48 88 52 95C54 98 56 99 58 98C64 95 68 88 72 78C76 68 78 58 78 48C78 38 76 29 72 22C68 15 60 10 50 10Z" />
      </svg>

      {/* Right side tooth */}
      <svg
        className="absolute -right-12 top-1/3 w-56 h-56 opacity-[0.05] rotate-12"
        viewBox="0 0 100 100"
        fill="none"
        stroke={strokeColor}
        strokeWidth="0.8"
      >
        <path d="M50 10C40 10 32 15 28 22C24 29 22 38 22 48C22 58 24 68 28 78C32 88 36 95 42 98C44 99 46 98 48 95C52 88 54 78 54 68C54 63 56 58 50 58C44 58 46 63 46 68C46 78 48 88 52 95C54 98 56 99 58 98C64 95 68 88 72 78C76 68 78 58 78 48C78 38 76 29 72 22C68 15 60 10 50 10Z" />
      </svg>

      {/* Bottom left curve */}
      <svg
        className="absolute left-10 bottom-1/4 w-48 h-48 opacity-[0.04] -rotate-6"
        viewBox="0 0 100 100"
        fill="none"
        stroke={strokeColor}
        strokeWidth="0.6"
      >
        <path d="M20 60 Q50 30 80 60" />
        <circle cx="50" cy="50" r="25" />
      </svg>

      {/* Bottom right accent */}
      <svg
        className="absolute right-20 bottom-20 w-32 h-32 opacity-[0.05]"
        viewBox="0 0 100 100"
        fill="none"
        stroke={strokeColor}
        strokeWidth="0.6"
      >
        <circle cx="50" cy="50" r="30" />
        <circle cx="50" cy="50" r="15" />
      </svg>

      {/* Small cross elements */}
      <svg
        className="absolute left-1/4 top-16 w-8 h-8 opacity-[0.06]"
        viewBox="0 0 24 24"
        fill={strokeColor}
      >
        <path d="M12 4v16M4 12h16" stroke={strokeColor} strokeWidth="2" fill="none" />
      </svg>

      <svg
        className="absolute right-1/3 bottom-32 w-6 h-6 opacity-[0.05]"
        viewBox="0 0 24 24"
      >
        <path d="M12 4v16M4 12h16" stroke={strokeColor} strokeWidth="2" fill="none" />
      </svg>
    </div>
  );
}
