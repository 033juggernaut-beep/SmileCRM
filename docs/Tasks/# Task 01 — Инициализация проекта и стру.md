# Task 01 — Инициализация проекта и структура репозитория

## Цель

Создать базовую структуру репо для Telegram Mini App стоматологов:

- `frontend/` — React + Vite + TS
- `backend/` — FastAPI + aiogram
- `docs/` и `tasks/` — документация и таски

---

## Что попросить сделать Cursor AI

Промпт (вставь в Cursor):

> Ты — senior fullstack разработчик. Создай структуру монорепозитория для Telegram Mini App стоматологов.
> 
> Требования:
> - Два подпроекта: `frontend/` (Vite + React + TypeScript) и `backend/` (FastAPI + aiogram).
> - Настрой простой `README.md` в корне, где кратко описан проект.
> - Добавь `.gitignore` (Node + Python).
> - Никакого Docker и ngrok.
> - Подготовь базовую структуру файлов (пустые заглушки), без сложной логики:
>   - `frontend/` — стандартный шаблон Vite React TS.
>   - `backend/app/main.py` — пустой FastAPI app.
>   - `backend/app/bot/` — директория под код aiogram (пока можно пустую).
> - Добавь в `docs/` ссылку на уже существующие архитектурные файлы (предполагаем, что они есть).
> 
> Не пиши код бота и API пока, просто задай структуру и минимальные заглушки.

---

## Что сделать самому (шаги)

1. Создай новый репозиторий (локально или на GitHub).
2. Создай папки: `frontend/`, `backend/`, `docs/`, `tasks/`.
3. Вставь этот файл как `tasks/01_project_setup.md`.
4. Открой Cursor, подключи репозиторий.
5. Запусти промпт выше в корне проекта.
6. После генерации:
   - Убедись, что `frontend/` собирается:  
     ```bash
     cd frontend
     npm install
     npm run dev
     ```
   - Убедись, что `backend/` запускается базово:  
     ```bash
     cd backend
     pip install -r requirements.txt  # если Cursor создал файл
     uvicorn app.main:app --reload
     ```

---

## Критерии готовности

- Есть рабочий Vite+React+TS проект в `frontend/`.
- Есть FastAPI-приложение в `backend/app/main.py`, которое отвечает на `/` или `/health`.
- Структура репо понятна и чистая.
