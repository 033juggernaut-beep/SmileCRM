/**
 * English translations
 */
const en = {
  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    yes: 'Yes',
    no: 'No',
    search: 'Search...',
  },
  
  // Home page
  home: {
    welcome: 'Welcome',
    subtitle: 'SmileCRM — dental practice management',
    trialActive: '✓ Trial active',
    patients: 'My patients',
    patientsHelper: 'View all patients',
    addPatient: 'Add patient',
    addPatientHelper: 'Create new patient',
    subscription: 'Subscription',
    subscriptionHelper: 'Manage subscription',
    help: 'Help',
    helpHelper: 'FAQ and support',
    privacy: 'Privacy Policy',
    privacyHelper: 'Privacy information',
    otherSections: 'Other sections',
    version: 'SmileCRM v1.0',
  },
  
  // Patients
  patients: {
    title: 'Patients',
    addNew: 'Add',
    noPatients: 'No patients yet',
    searchPlaceholder: 'Search...',
  },
  
  // Patient form
  patientForm: {
    firstName: 'First name',
    lastName: 'Last name',
    phone: 'Phone',
    diagnosis: 'Diagnosis',
    notes: 'Notes',
  },
  
  // Voice assistant
  voice: {
    title: 'Voice input',
    patient: 'patient',
    visit: 'visit',
    note: 'note',
    language: 'Recording language',
    startRecording: 'Start recording',
    stopRecording: 'Stop',
    processing: 'Processing...',
    apply: 'Apply',
    discard: 'Discard',
    recordingReady: 'Recording ready',
    process: 'Process',
    noData: 'No data recognized',
    transcript: 'Transcript',
    extractedData: 'Extracted data',
  },
  
  // Subscription
  subscription: {
    title: 'Subscription',
    currentPlan: 'Current plan',
    trial: 'Trial',
    premium: 'Premium',
  },
  
  // Help
  help: {
    title: 'Help',
    faq: 'Frequently asked questions',
    contact: 'Contact us',
  },
  
  // Auth
  auth: {
    connecting: 'Connecting...',
    authenticating: 'Authenticating...',
  },
} as const

export default en
