import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { AuthLoadingPage } from './pages/AuthLoadingPage'
import { HomePage } from './pages/HomePage'
import { AddPatientPage } from './pages/AddPatientPage'
import { PatientDetailsPage } from './pages/PatientDetailsPage'
import { PatientsListPage } from './pages/PatientsListPage'
import { RegisterDoctorPage } from './pages/RegisterDoctorPage'
import { SubscriptionPage } from './pages/SubscriptionPage'
import { HelpPage } from './pages/HelpPage'
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage'

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <AuthLoadingPage /> },
      { path: '/register', element: <RegisterDoctorPage /> },
      { path: '/home', element: <HomePage /> },
      { path: '/patients', element: <PatientsListPage /> },
      { path: '/patients/new', element: <AddPatientPage /> },
      { path: '/patients/:id', element: <PatientDetailsPage /> },
      { path: '/subscription', element: <SubscriptionPage /> },
      { path: '/help', element: <HelpPage /> },
      { path: '/privacy', element: <PrivacyPolicyPage /> },
    ],
  },
])

const App = () => <RouterProvider router={router} />

export default App
