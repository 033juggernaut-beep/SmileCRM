/**
 * Minimal footer with service links
 * - Calm, informational design
 * - Small font, neutral blue/gray
 * - Subtle hover underline
 */

interface FooterProps {
  isDark: boolean;
}

const footerLinks = [
  { label: 'Оплата', href: '#payment' },
  { label: 'Помощь', href: '#help' },
  { label: 'Политика конфиденциальности', href: '#privacy' },
];

export function Footer({ isDark }: FooterProps) {
  return (
    <footer
      className={`w-full py-6 mt-auto ${
        isDark ? 'border-t border-slate-800' : 'border-t border-blue-100/50'
      }`}
    >
      <nav className="flex items-center justify-center gap-6 flex-wrap px-4">
        {footerLinks.map((link, index) => (
          <a
            key={index}
            href={link.href}
            className={`text-xs font-normal transition-all duration-200 hover:underline underline-offset-2 ${
              isDark
                ? 'text-slate-500 hover:text-slate-400'
                : 'text-slate-400 hover:text-slate-500'
            }`}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
