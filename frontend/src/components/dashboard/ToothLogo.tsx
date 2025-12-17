/**
 * ToothLogo - Minimal tooth icon for header branding
 * Matches Superdesign reference exactly
 */

interface ToothLogoProps {
  size?: number;
  color?: string;
  className?: string;
}

export function ToothLogo({ 
  size = 28, 
  color = 'currentColor',
  className = '' 
}: ToothLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2C9.5 2 7.5 3 6.5 4.5C5.5 6 5 8 5 10C5 12 5.5 14 6 16C6.5 18 7 20 8 21.5C8.5 22 9 22 9.5 21.5C10.5 20 11 18 11 16C11 15 11.5 14 12 14C12.5 14 13 15 13 16C13 18 13.5 20 14.5 21.5C15 22 15.5 22 16 21.5C17 20 17.5 18 18 16C18.5 14 19 12 19 10C19 8 18.5 6 17.5 4.5C16.5 3 14.5 2 12 2Z" />
    </svg>
  );
}

export default ToothLogo;
