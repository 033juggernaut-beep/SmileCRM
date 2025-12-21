/**
 * Subtle background pattern with tooth shapes
 * Creates medical atmosphere without distraction
 */

interface BackgroundPatternProps {
  isDark: boolean;
}

export function BackgroundPattern({ isDark }: BackgroundPatternProps) {
  const opacity = isDark ? '0.02' : '0.03';
  const color = isDark ? '#60A5FA' : '#3B82F6';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="tooth-pattern-card"
            x="0"
            y="0"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M30 15C27.5 15 25.5 16 24.5 17.5C23.5 19 23 21 23 23C23 25 23.5 27 24 29C24.5 31 25 33 26 34.5C26.5 35 27 35 27.5 34.5C28.5 33 29 31 29 29C29 28 29.5 27 30 27C30.5 27 31 28 31 29C31 31 31.5 33 32.5 34.5C33 35 33.5 35 34 34.5C35 33 35.5 31 36 29C36.5 27 37 25 37 23C37 21 36.5 19 35.5 17.5C34.5 16 32.5 15 30 15Z"
              fill={color}
              fillOpacity={opacity}
            />
            <path
              d="M90 75C87.5 75 85.5 76 84.5 77.5C83.5 79 83 81 83 83C83 85 83.5 87 84 89C84.5 91 85 93 86 94.5C86.5 95 87 95 87.5 94.5C88.5 93 89 91 89 89C89 88 89.5 87 90 87C90.5 87 91 88 91 89C91 91 91.5 93 92.5 94.5C93 95 93.5 95 94 94.5C95 93 95.5 91 96 89C96.5 87 97 85 97 83C97 81 96.5 79 95.5 77.5C94.5 76 92.5 75 90 75Z"
              fill={color}
              fillOpacity={opacity}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tooth-pattern-card)" />
      </svg>
    </div>
  );
}
