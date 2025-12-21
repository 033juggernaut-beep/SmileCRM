import { SmileCRMBlueDashboard } from './Component';

export default function App() {
  return (
    <SmileCRMBlueDashboard
      initialLang="RU"
      initialTheme="light"
      totalPatients={1247}
      todayVisits={12}
      notificationCount={3}
    />
  );
}
