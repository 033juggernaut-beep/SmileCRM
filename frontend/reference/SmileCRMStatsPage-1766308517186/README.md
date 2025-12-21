# SmileCRM Statistics Page

A comprehensive statistics dashboard for the dental CRM web application. Production-ready SaaS-style layout with header, footer, and dashboard cards.

## Features

- **Header Navigation**: Logo, language switcher (AM/RU/EN), notification bell, theme toggle
- **Dashboard Cards**: Мои пациенты, Добавить пациента, Маркетинг, Статистика
- **Statistics Sections**: General metrics, Visits, Finance (MVP), Dynamics chart
- **Footer**: Links to Оплата, Помощь, Политика конфиденциальности
- **Desktop-first responsive layout**
- **Dark mode support**

## Usage

```tsx
import { SmileCRMStatsPage } from '@/sd-components/f0178620-dbcb-4ec5-b119-bbb66a7bd057';

function MyPage() {
  const [isDark, setIsDark] = useState(false);
  
  return (
    <SmileCRMStatsPage 
      isDark={isDark}
      onThemeToggle={() => setIsDark(!isDark)}
      onBack={() => router.back()} 
      initialPeriod="7d"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onBack` | `() => void` | `undefined` | Callback for back navigation |
| `className` | `string` | `undefined` | Additional CSS classes |
| `initialPeriod` | `'7d' \| '30d'` | `'7d'` | Initial chart period |
| `isDark` | `boolean` | `false` | Current theme state |
| `onThemeToggle` | `() => void` | `undefined` | Theme toggle callback |

## Dependencies

- `lucide-react`: ^0.292.0
- `framer-motion`: ^10.16.4
- `tailwind-merge`: ^2.0.0
- `clsx`: ^2.0.0
