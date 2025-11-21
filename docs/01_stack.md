# Tech Stack для Telegram Mini App стоматологов

## Цели проекта

Создать Telegram Mini App для армянских стоматологов:

- Регистрация врача → запуск пробного периода 7 дней
- Ведение пациентов: карточки, визиты, заметки, медиа
- Оплата подписки после триала через Idram / IDBank Pay
- Управление подпиской через Telegram-бот и Mini App

## Стек

### Frontend (Mini App)

- React + Vite + TypeScript
- Chakra UI (UI-компоненты)
- Telegram Web Apps JS SDK
- React Query или TanStack Query для работы с API
- Supabase JS SDK (при необходимости прямого доступа)

### Backend

- FastAPI
  - REST API для Mini App
  - Webhook endpoints для платежей (Idram / IDBank Pay)
- aiogram v3
  - Telegram-бот
  - Команда /start и меню
  - Кнопка открытия WebApp
- Uvicorn для локального запуска
- Без Docker и без ngrok

### Database / Infra

- Supabase:
  - Postgres для данных:
    - doctors
    - patients
    - visits
    - media_files
    - subscriptions
    - payments
  - Auth для идентификации врача (привязка к Telegram user_id)
  - Storage для медиа (рентген/фото)

### Деплой (без Docker, без ngrok)

- Frontend (Vite + React):
  - Vercel / Netlify (статический хостинг)
- Backend (FastAPI + aiogram):
  - Render / Railway / аналогичный PaaS:
    - Один Python-проект
    - Запуск: uvicorn main:app
- В Telegram:
  - Mini App URL → фронтенд (https)
  - Bot Webhook URL → backend (https)
