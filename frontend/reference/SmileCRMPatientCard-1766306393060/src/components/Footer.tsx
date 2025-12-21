/**
 * Footer component - minimal service links
 * - Оплата, Помощь, Политика конфиденциальности
 * - Consistent with dashboard and patients list
 */

interface FooterProps {
  isDark: boolean;
}

export function Footer({ isDark }: FooterProps) {
  const links = ['Оплата', 'Помощь', 'Политика конфиденциальности'];

  return (
    <footer
      className={`w-full py-4 mt-auto border-t transition-colors ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}
    >
      <div className="flex items-center justify-center gap-4">
        {links.map((link, index) => (
          <span key={link} className="flex items-center gap-4">
            <button
              className={`text-xs transition-colors ${
                isDark
                  ? 'text-slate-500 hover:text-slate-400'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {link}
            </button>
            {index < links.length - 1 && (
              <span
                className={`text-xs ${
                  isDark ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                ·
              </span>
            )}
          </span>
        ))}
      </div>
    </footer>
  );
}
