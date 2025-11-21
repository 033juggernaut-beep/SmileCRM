
---

## `tasks/08_supabase_schema_and_connection.md`

```md
# Task 08 — Настройка Supabase и базовой схемы (doctors, patients)

## Цель

Подключить Supabase к backend и создать минимум 2 таблицы:

- `doctors`
- `patients`

---

## Что попросить сделать Cursor AI

> В `backend/app/services/supabase_client.py` реализуй клиент Supabase:
> 
> - Используй `supabase-py` или HTTP-клиент (httpx) к PostgREST API.
> - Клиент должен уметь:
>   - Выполнять `select/insert/update` в таблицах `doctors` и `patients`.
> 
> В `docs/05_db_supabase_schema.md` уже описана структура таблиц. Исходи из неё.
> 
> Создай сервис:
> - `doctors_service.py`:
>   - `get_by_telegram_user_id`
>   - `create_doctor_from_telegram_and_form`
> - `patients_service.py`:
>   - `list_by_doctor`
>   - `create_patient`
>   - `get_patient`
> 
> Пока можно реализовать только заглушки с примером работы с Supabase, без сложных фильтров.

---

## Что сделать самому

1. В Supabase:
   - Создай новый проект.
   - Скопируй `SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY` (или anon key).
   - Вставь их в `.env` backend-а:
     ```env
     SUPABASE_URL=...
     SUPABASE_SERVICE_ROLE_KEY=...
     ```
2. Создай таблицы `doctors` и `patients` в Supabase (можешь:
   - Либо руками через UI.
   - Либо попросить Cursor сгенерировать SQL миграции и выполнить их в Supabase SQL editor).
3. Протестируй простые операции (через временный endpoint) — `insert` и `select`.

---

## Критерии готовности

- Backend реально подключается к Supabase.
- В таблице `doctors` можно руками увидеть записи.
