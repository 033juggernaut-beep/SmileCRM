# Task 10 — API подписки и создание платежей (Idram/IDBank, заглушка)

## Цель

Сделать:

- `GET /subscription` — статус подписки.
- `POST /subscription/create-payment` — создание платежа (пока заглушка).
- Заготовки webhook'ов `/webhook/payments/idram`, `/webhook/payments/idbank`.

---

## Что попросить сделать Cursor AI

> В `backend/app/api/subscription.py` и `payments.py` реализуй:
> 
> 1. `GET /subscription`:
>    - По текущему врачу (из токена) возвращает:
>      - `status`: 'trial' | 'active' | 'expired'
>      - `trialEndsAt`
>      - `currentPeriodEnd`
> 
> 2. `POST /subscription/create-payment`:
>    - Создаёт запись в таблице `payments` (Supabase).
>    - Генерирует фейковый `payment_url` вида:
>      - `https://example.com/pay/{payment_id}`
>    - Возвращает его фронтенду.
> 
> 3. `POST /webhook/payments/idram` и `POST /webhook/payments/idbank`:
>    - Пока просто принимают JSON, логируют его и по `external_payment_id` помечают платёж как "paid".
>    - Далее обновляют `subscription_status` врача → 'active' + задают `current_period_end` на +1 месяц.
> 
> Все операции работают через `subscription_service` и `payments_service`.

---

## Что сделать самому

1. В Supabase добавить таблицы `subscriptions` и `payments`, как описано в `docs/05_db_supabase_schema.md`.
2. Связать frontend:
   - `SubscriptionPage` → `GET /subscription` и `POST /subscription/create-payment`.
   - При нажатии "Оплатить" — открывать `payment_url` через `window.Telegram.WebApp.openLink`.

---

## Критерии готовности

- `GET /subscription` возвращает реальный статус в зависимости от trial-полей в Supabase.
- Создание "платежа" создаёт запись в `payments`.
