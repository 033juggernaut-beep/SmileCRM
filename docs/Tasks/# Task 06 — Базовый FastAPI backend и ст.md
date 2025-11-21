# Task 06 — Базовый FastAPI backend и структура модулей

## Цель

Сделать структуру backend-проекта, которая совпадает с архитектурой из `docs/04_backend_api_bot.md`.

---

## Что попросить сделать Cursor AI

> В `backend/` настрой, пожалуйста, базовый FastAPI-проект со структурой:
> 
> ```
> backend/
>   app/
>     main.py
>     config.py
>     api/
>       __init__.py
>       auth.py
>       doctors.py
>       patients.py
>       visits.py
>       subscription.py
>       media.py
>       payments.py
>     services/
>       __init__.py
>       telegram_auth.py
>       doctors_service.py
>       patients_service.py
>       subscription_service.py
>       payments_service.py
>       supabase_client.py
>     models/
>       __init__.py
>       dto.py
> ```
> 
> Требования:
> - `main.py` должен создавать `FastAPI` app и подключать router'ы из `api` с префиксом `/api`.
> - Пока endpoints могут быть пустыми или с простыми заглушками (`return {"ok": true}`).
> - Создай `config.py` с Pydantic Settings (например `Settings`) и параметрами:
>   - `SUPABASE_URL`
>   - `SUPABASE_ANON_KEY`
>   - `TELEGRAM_BOT_TOKEN`
>   - и т.п.
> - Создай базовый `supabase_client.py`, который просто читает эти переменные и готов к использованию (но без реальных запросов).
> 
> Не реализуй ещё бизнес-логику, только каркас.

---

## Что сделать самому

1. Установи зависимости:
   ```bash
   cd backend
   pip install fastapi uvicorn pydantic[dotenv] httpx
