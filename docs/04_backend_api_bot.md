# Backend: FastAPI + aiogram

## Цели backend

- Принимать и валидировать Telegram initData
- Работать с Supabase (DB, Storage)
- Реализовать бизнес-логику пациентов и визитов
- Обрабатывать webhooks Idram / IDBank Pay
- Управлять подпиской врача

## Структура проекта

backend/
app/
main.py # FastAPI + mount aiogram webhook
config.py
dependencies.py
api/
init.py
auth.py
doctors.py
patients.py
visits.py
subscription.py
media.py
payments.py
bot/
init.py
bot.py # aiogram Bot и Dispatcher
handlers/
start.py
menu.py
subscription.py
services/
telegram_auth.py
doctors_service.py
patients_service.py
subscription_service.py
payments_service.py
supabase_client.py
models/
dto.py # Pydantic-схемы
db/
migrations/ # SQL для Supabase (опционально)

markdown
Копировать код

## FastAPI маршруты

### Auth

- `POST /auth/telegram`
  - Вход: `init_data` (строка)
  - Логика:
    - Валидация подписи initData (секрет бота)
    - Извлечение `telegram_user_id`
    - Поиск/создание врача в Supabase
    - Возврат: JWT (access token) + данные врача

### Doctors

- `GET /me` – текущий врач (по JWT)
- `POST /doctors/register` – регистрация врача (из Mini App)

### Patients

- `GET /patients`
- `POST /patients`
- `GET /patients/{patient_id}`
- `PATCH /patients/{patient_id}`
- `DELETE /patients/{patient_id}` (возможно не нужен)

### Visits

- `GET /patients/{patient_id}/visits`
- `POST /patients/{patient_id}/visits`
- `PATCH /visits/{visit_id}`

### Media

- `POST /patients/{patient_id}/media` – загрузка файла
- `GET /patients/{patient_id}/media` – список

### Subscription

- `GET /subscription` – статус подписки врача
- `POST /subscription/create-payment` – создать платеж (Idram / IDBank)

### Payments webhooks

- `POST /webhook/payments/idram`
- `POST /webhook/payments/idbank`

## aiogram Bot

Функции:

- `/start`:
  - Проверка: есть ли врач по telegram_user_id
  - Если нет → текст: нажмите, чтобы открыть Mini App и зарегистрироваться
  - Если да → показать меню

- Главное меню (ReplyKeyboard или InlineKeyboard):
  - ➕ Ավելացնել նոր պացիենտ → открыть Mini App на странице AddPatient
  - 📋 Իմ պացիենտները → открыть Mini App на PatientsList
  - 💳 Բաժանորդագրություն → открыть Mini App на SubscriptionPage
  - ℹ️ Օգնություն → отправить текст + открыть HelpPage
  - 🔒 Գաղտնիության քաղաքականություն → отправить текст или ссылку

- Inline-кнопки внутри бота:
  - Можно дублировать кнопки "Նոր այց", "Հաջորդ այց" и т.п., но основная работа — внутри Mini App

## Swapping без Docker и ngrok

- `main.py`:
  - Создание FastAPI app
  - Подключение маршрутов API
  - Регистрация webhook-роутов для aiogram
- Деплой на PaaS, webhook URL бота → `https://<backend-domain>/bot/webhook`
