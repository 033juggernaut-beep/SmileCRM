/**
 * Russian translations
 */
const ru = {
  // Common
  common: {
    loading: 'Загрузка...',
    error: 'Ошибка',
    retry: 'Повторить',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Изменить',
    close: 'Закрыть',
    back: 'Назад',
    next: 'Далее',
    yes: 'Да',
    no: 'Нет',
    search: 'Поиск...',
  },
  
  // Home page
  home: {
    welcome: 'Добро пожаловать',
    subtitle: 'SmileCRM — управление стоматологической практикой',
    trialActive: '✓ Пробный период активен',
    patients: 'Мои пациенты',
    patientsHelper: 'Просмотр всех пациентов',
    addPatient: 'Добавить пациента',
    addPatientHelper: 'Создать нового пациента',
    subscription: 'Подписка',
    subscriptionHelper: 'Управление подпиской',
    help: 'Помощь',
    helpHelper: 'FAQ и поддержка',
    privacy: 'Политика конфиденциальности',
    privacyHelper: 'Информация о конфиденциальности',
    otherSections: 'Другие разделы',
    version: 'SmileCRM v1.0',
  },
  
  // Patients
  patients: {
    title: 'Пациенты',
    addNew: 'Добавить',
    noPatients: 'Пациентов нет',
    searchPlaceholder: 'Поиск...',
  },
  
  // Patient form
  patientForm: {
    firstName: 'Имя',
    lastName: 'Фамилия',
    phone: 'Телефон',
    diagnosis: 'Диагноз',
    notes: 'Заметки',
  },
  
  // Voice assistant
  voice: {
    title: 'Голосовой ввод',
    patient: 'пациента',
    visit: 'визита',
    note: 'заметки',
    language: 'Язык записи',
    startRecording: 'Начать запись',
    stopRecording: 'Остановить',
    processing: 'Обработка...',
    apply: 'Применить',
    discard: 'Отменить',
    recordingReady: 'Запись готова',
    process: 'Обработать',
    noData: 'Данные не распознаны',
    transcript: 'Распознанный текст',
    extractedData: 'Извлечённые данные',
  },
  
  // Subscription
  subscription: {
    title: 'Подписка',
    currentPlan: 'Текущий план',
    trial: 'Пробный период',
    premium: 'Премиум',
  },
  
  // Help
  help: {
    title: 'Помощь',
    faq: 'Часто задаваемые вопросы',
    contact: 'Связаться',
  },
  
  // Auth
  auth: {
    connecting: 'Подключение...',
    authenticating: 'Авторизация...',
  },
} as const

export default ru
