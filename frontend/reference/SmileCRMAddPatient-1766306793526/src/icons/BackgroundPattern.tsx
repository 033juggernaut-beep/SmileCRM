/**
 * Subtle dental-themed background pattern
 * - Very low opacity tooth icons
 * - Adds depth without distraction
 */

interface BackgroundPatternProps {
  isDark: boolean;
}

export function BackgroundPattern({ isDark }: BackgroundPatternProps) {
  const opacity = isDark ? 0.03 : 0.04;
  const fill = isDark ? '#60A5FA' : '#3B82F6';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="tooth-pattern-add-patient"
            x="0"
            y="0"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M40 10C37.5 10 35.5 11.5 35 13.5C34.5 15.5 34 17 33.5 19C33 21 32.5 23.5 33 25.5C33.5 27.5 34.5 29 36 29.5C37.5 30 38.5 28.5 39 27C39.5 25.5 39.5 24 40 24C40.5 24 40.5 25.5 41 27C41.5 28.5 42.5 30 44 29.5C45.5 29 46.5 27.5 47 25.5C47.5 23.5 47 21 46.5 19C46 17 45.5 15.5 45 13.5C44.5 11.5 42.5 10 40 10Z"
              fill={fill}
              opacity={opacity}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tooth-pattern-add-patient)" />
      </svg>
    </div>
  );
}
