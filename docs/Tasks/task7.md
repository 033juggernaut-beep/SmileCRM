
---

## `tasks/07_backend_telegram_auth_endpoint.md`

```md
# Task 07 — Endpoint /auth/telegram с валидацией initData

## Цель

Сделать настоящий `/auth/telegram` endpoint, который:

- Принимает `init_data` строкой.
- Валидирует подпись согласно правилам Telegram WebApp.
- Возвращает:
  - информацию о том, есть ли врач в БД,
  - временный токен (можно пока использовать простой JWT или заглушку).

---

## Что попросить сделать Cursor AI

> В `backend/app/api/auth.py` реализуй endpoint:
> 
> - `POST /auth/telegram`
> 
> Вход:
> ```json
> {
>   "init_data": "строка из window.Telegram.WebApp.initData"
> }
> ```
> 
> Логика:
> 
> 1. Реализуй в `services/telegram_auth.py` функцию:
>    - `validate_init_data(init_data: str, bot_token: str) -> TelegramUserInfo`
>    - Она должна:
>      - Распарсить query-string.
>      - Проверить хэш по алгоритму из Telegram docs (HMAC-SHA256 с `secret_key = SHA256(bot_token)`).
>      - Вернуть структуру с:
>        - `telegram_user_id`
>        - `first_name`, `last_name`, `username` (если есть).
> 2. В endpoint-е:
>    - Вызвать `validate_init_data`.
>    - По `telegram_user_id` проверить в БД (через `doctors_service`) наличия врача.
>    - Пока можно не ходить в Supabase, а сделать заглушку `doctor_exists = False`.
> 3. Ответ:
> ```json
> {
>   "doctorExists": false,
>   "accessToken": "строка-заглушка"
> }
> ```
> 
> Используй Pydantic-модели для request/response (`models/dto.py`).

---

## Что сделать самому

1. В `.env` backend-а добавить:
   ```env
   TELEGRAM_BOT_TOKEN=твой_тестовый_бот_токен
