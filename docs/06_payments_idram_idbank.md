# Платежи: Idram / IDBank Pay

## Общий флоу

1. Врач нажимает "Оплатить" на странице Subscription в Mini App.
2. Frontend вызывает `POST /subscription/create-payment`.
3. Backend:
   - Создает запись `payments` со статусом `pending`.
   - Формирует запрос в Idram / IDBank Pay API.
   - Получает `payment_url` или `deeplink`.
   - Возвращает URL в Mini App.
4. Mini App вызывает `window.Telegram.WebApp.openLink(payment_url)`.
5. Пользователь оплачивает.
6. Платежная система вызывает Webhook backend:
   - `/webhook/payments/idram`
   - `/webhook/payments/idbank`
7. Backend:
   - Проверяет подпись / секрет.
   - Обновляет `payments.status = 'paid'` и `paid_at`.
   - Обновляет статус подписки врача:
     - `subscription_status = 'active'`
     - `current_period_start = now()`
     - `current_period_end = now() + interval '1 month'`
8. В Mini App при следующем запросе на `/subscription` врач видит активную подписку.

## Endpoint: POST /subscription/create-payment

Вход:

- JWT врача (из заголовка)
- Параметры тарифа (опционально, сейчас 1 тариф)

Выход:

- `payment_url`

Логика:

- Найти врача
- Создать запись payments
- Вызвать API Idram/IDBank для создания счёта
- Сохранить `external_payment_id` в payments
- Вернуть `payment_url`

## Webhook endpoints

### POST /webhook/payments/idram

- Тело запроса зависит от Idram API
- Действия:
  - Валидация подписи
  - По `external_payment_id` найти запись в `payments`
  - Если статус "успешно":
    - Обновить payment.status → 'paid'
    - Обновить/создать запись subscriptions для врача
  - Ответ 200 OK

### POST /webhook/payments/idbank

- Аналогично Idram, но со спецификой IDBank
