# SmileCRM Notification Dropdown

A compact notification dropdown component for SmileCRM dental CRM. Displays critical notifications requiring doctor's attention.

## Dependencies

```json
{
  "react": "^18.2.0",
  "lucide-react": "^0.294.0",
  "framer-motion": "^10.16.4",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0"
}
```

## Props & Types

```typescript
type NotificationType = 
  | 'visit_upcoming'      // "In 1 hour: visit with..."
  | 'visit_remaining'     // "Today remaining visits: 3"
  | 'patient_no_show'     // "Patient did not show up: ..."
  | 'patient_overdue'     // "2 patients have overdue visits"
  | 'system_trial'        // "Trial ends in 2 days"
  | 'system_subscription' // "Subscription activated"

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: Date;
  read?: boolean;
  targetPath?: string;  // Navigation path when clicked
}

interface NotificationDropdownProps {
  notifications: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllRead?: () => void;
  isDark?: boolean;     // Theme mode
  className?: string;
}
```

## Usage Example

```tsx
import { NotificationDropdown, Notification } from '@/sd-components/f74de9a7-37bb-48b6-9764-bfe9e69b2fe4';

const notifications: Notification[] = [
  {
    id: '1',
    type: 'visit_upcoming',
    message: 'In 1 hour: visit with Anna Petrosyan',
    timestamp: new Date(),
    read: false,
    targetPath: '/visits/today'
  },
  {
    id: '2',
    type: 'patient_no_show',
    message: 'Patient did not show up: Arman A.',
    timestamp: new Date(Date.now() - 3600000),
    read: false,
    targetPath: '/patients/arman-a'
  }
];

function Header() {
  const handleNotificationClick = (notification: Notification) => {
    // Navigate to notification.targetPath
    console.log('Navigate to:', notification.targetPath);
  };

  return (
    <header>
      <NotificationDropdown
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onMarkAllRead={() => console.log('Mark all read')}
        isDark={false}
      />
    </header>
  );
}
```
