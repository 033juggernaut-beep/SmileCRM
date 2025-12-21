import { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Spinner, Center } from '@chakra-ui/react'
import { AppLayout } from './components/AppLayout'

// Eagerly loaded (small, needed immediately for auth flow)
import { AuthLoadingPage } from './pages/AuthLoadingPage'
import { RegisterDoctorPage } from './pages/RegisterDoctorPage'

// Lazy loaded (all feature pages, loaded on demand for faster initial bundle)
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })))
const PatientsListPage = lazy(() => import('./pages/PatientsListPage').then(m => ({ default: m.PatientsListPage })))
const PatientDetailsPage = lazy(() => import('./pages/PatientDetailsPage').then(m => ({ default: m.PatientDetailsPage })))
const AddPatientPage = lazy(() => import('./pages/AddPatientPage').then(m => ({ default: m.AddPatientPage })))
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage').then(m => ({ default: m.SubscriptionPage })))
const HelpPage = lazy(() => import('./pages/HelpPage').then(m => ({ default: m.HelpPage })))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })))
const MarketingPage = lazy(() => import('./pages/MarketingPage').then(m => ({ default: m.MarketingPage })))
const StatsPage = lazy(() => import('./pages/StatsPage').then(m => ({ default: m.StatsPage })))

// Loading fallback for lazy routes (minimal, fast-loading skeleton)
const PageLoader = () => (
  <Center 
    h="100dvh" 
    bg="var(--app-bg, #F7FAFF)"
    sx={{
      '@supports not (height: 100dvh)': {
        h: 'var(--app-height, 100vh)',
      },
    }}
  >
    <Spinner size="lg" color="var(--app-primary, #2563EB)" thickness="3px" speed="0.7s" />
  </Center>
)

// Wrap lazy component with Suspense
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
)

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <AuthLoadingPage /> },
      { path: '/register', element: <RegisterDoctorPage /> },
      { path: '/home', element: withSuspense(HomePage) },
      { path: '/patients', element: withSuspense(PatientsListPage) },
      { path: '/patients/new', element: withSuspense(AddPatientPage) },
      { path: '/patients/:id', element: withSuspense(PatientDetailsPage) },
      { path: '/subscription', element: withSuspense(SubscriptionPage) },
      { path: '/marketing', element: withSuspense(MarketingPage) },
      { path: '/help', element: withSuspense(HelpPage) },
      { path: '/privacy', element: withSuspense(PrivacyPolicyPage) },
      { path: '/stats', element: withSuspense(StatsPage) },
    ],
  },
])

const App = () => <RouterProvider router={router} />

export default App
