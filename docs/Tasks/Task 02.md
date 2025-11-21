# Task 02 — Подключение Telegram WebApp SDK и базовый layout

## Цель

Подключить Telegram Web Apps JS SDK в frontend, настроить базовый layout Mini App и страницу загрузки (loading).

---

## Что попросить сделать Cursor AI

> Настрой, пожалуйста, в проекте `frontend/` поддержку Telegram WebApp:
> 
> 1. Подключи Telegram WebApp JS SDK:
>    - Добавь декларацию типов для `window.Telegram` (если нужно — через `global.d.ts`).
> 2. Создай хук `useTelegramInitData` в `src/hooks/useTelegramInitData.ts`:
>    - Он должен читать `window.Telegram.WebApp.initData` и `initDataUnsafe`.
>    - Вернуть объект вида:
>      ```ts
>      {
>        initDataRaw: string | null;
>        user: { id: number; first_name?: string; last_name?: string; username?: string } | null;
>      }
>      ```
> 3. В `App.tsx`:
>    - Показывай экран загрузки, пока initData не прочитано.
>    - Если `initDataRaw` отсутствует, показывай ошибку: "Telegram WebApp initData missing".
> 4. Сделай простой layout с Chakra UI:
>    - Верхний AppBar с названием ("Dental Mini App").
>    - Контент по центру, адаптированный под маленький экран.
> 
> Никаких запросов на backend пока не делай, только чтение initData.

---

## Что сделать самому

1. Убедись, что в `frontend` установлена Chakra UI (если нет — попроси Cursor установить).
2. Запусти `npm run dev`.
3. cd

---

## Критерии готовности

- Код не падает при отсутствии `window.Telegram`.
- Есть хук `useTelegramInitData`.
- Есть минимальный layout с "Dental Mini App".
