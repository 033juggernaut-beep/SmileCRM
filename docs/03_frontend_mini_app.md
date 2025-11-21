# Frontend (Mini App) – структура

## Технологии

- React + Vite + TypeScript
- Chakra UI
- Telegram Web Apps JS SDK
- React Router
- React Query (TanStack Query)
- Axios или fetch wrapper

## Структура папок

frontend/
src/
main.tsx
app/
App.tsx
router.tsx
components/
layout/
patients/
subscription/
common/
pages/
AuthLoadingPage.tsx
RegisterDoctorPage.tsx
HomePage.tsx
PatientsListPage.tsx
PatientDetailsPage.tsx
AddPatientPage.tsx
SubscriptionPage.tsx
HelpPage.tsx
PrivacyPolicyPage.tsx
api/
client.ts
auth.ts
patients.ts
visits.ts
subscription.ts
hooks/
useTelegramInitData.ts
useAuth.ts
types/
doctor.ts
patient.ts
visit.ts
subscription.ts

markdown
Копировать код

## Основные экраны

### 1. AuthLoadingPage

- Читает `window.Telegram.WebApp.initData`
- Отправляет initData на `/auth/telegram`
- Если врач существует → `HomePage`
- Если нет → `RegisterDoctorPage`

### 2. RegisterDoctorPage

Поля:

- Имя
- Фамилия
- Специализация
- Телефон
- Название клиники

Логика:

- Отправка формы на `/doctors/register`
- Создание записи врача + запуск триала (7 дней)
- Редирект на `HomePage`

### 3. HomePage

Секции / кнопки:

- «📋 Իմ պացիենտները» → `PatientsListPage`
- «➕ Ավելացնել նոր պացիենտ» → `AddPatientPage`
- «💳 Բաժանորդագրություն» → `SubscriptionPage`
- «ℹ️ Օգնություն» → `HelpPage`
- «🔒 Գաղտնիության քաղաքականություն» → `PrivacyPolicyPage`

Также можно показать:

- Имя врача
- Статус: "Trial до [дата]" или "Активная подписка до [дата]"

### 4. PatientsListPage

- Таблица/список:
  - Имя + фамилия
  - Диагноз
  - Статус (завершен / в процессе)
- Фильтры:
  - По статусу
  - По имени
- Клик по пациенту → `PatientDetailsPage`

### 5. PatientDetailsPage

Поля/блоки:

- Имя, фамилия
- Диагноз
- Последний визит
- Следующий визит
- Заметки (textarea)
- Медиа (список файлов + кнопка «📷 Ավելացնել նկարը»)

Кнопки:

- «🆕 Նոր այց»
- «📅 Հաջորդ այց»
- «💾 Պահպանել»

### 6. AddPatientPage

Форма:

- Имя
- Фамилия
- Диагноз
- Телефон (опционально)
- Статус: в процессе / завершен

### 7. SubscriptionPage

Показывает:

- Текущий статус (trial / оплачено / истек)
- Дата окончания триала или подписки
- Кнопка «Оплатить через Idram» / «Оплатить через IDBank Pay»

Логика:

- Нажатие на кнопку → запрос к Backend на создание платежа
- Backend возвращает payment URL или deep link
- В Mini App → открытие ссылки (`window.Telegram.WebApp.openLink`)

### 8. HelpPage / PrivacyPolicyPage

- Статические тексты (можно хранить в markdown или просто как JSX)