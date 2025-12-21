/**
 * Demo/Preview for SmileCRM Add Patient page
 */

import { SmileCRMAddPatient } from './Component';

export default function App() {
  return (
    <SmileCRMAddPatient
      initialLang="RU"
      initialTheme="light"
      notificationCount={3}
      onSave={(data) => console.log('Patient saved:', data)}
      onCancel={() => console.log('Cancelled')}
    />
  );
}
