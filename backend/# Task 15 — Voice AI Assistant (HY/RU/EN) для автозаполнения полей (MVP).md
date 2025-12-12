# Task 15 — Voice AI Assistant (HY/RU/EN) для автозаполнения полей (MVP)

## Цель

Добавить в Mini App голосового помощника:

- Врач записывает аудио прямо в Mini App.
- Backend делает **Speech-to-Text** (HY/RU/EN + mixed).
- Затем AI превращает текст в **строгий JSON** по схеме.
- Frontend **предзаполняет поля формы**, но **НЕ сохраняет автоматически**.
- Врач проверяет → нажимает обычную кнопку “Сохранить”.

MVP режимы:
1) **Новый пациент** (заполняет форму пациента)
2) **Новый визит** (заполняет данные визита + следующий визит + заметки)
3) **Заметка** (только notes/комментарий)

---

## Важно (принципы)

- AI **никогда** не делает автосохранение в БД.
- AI возвращает только то, в чём уверен. Если не уверен — ставит `null`.
- Всегда показываем врачу:
  - распознанный текст (transcript)
  - “Уверенность/сигналы” (минимально: “нужно проверить” если много null)

---

## Что попросить сделать Cursor AI

> Ты — senior fullstack разработчик. Реализуй Voice AI Assistant для SmileCRM (Telegram Mini App) с поддержкой армянского/русского/английского.
>
> Стек:
> - Frontend: React + Vite + TS + Chakra UI
> - Backend: FastAPI
> - Авторизация: существующий Bearer accessToken
>
> В рамках MVP сделай:
> - Запись голоса в браузере (Telegram WebView)
> - Upload на backend
> - STT (speech-to-text) с режимом language: auto/hy/ru/en
> - LLM parsing → строгий JSON
> - Предзаполнение форм на фронте
>
> Не делай автосохранение, только заполнение.

---

# 1) API спецификация (Backend)

## 1.1 Endpoint: POST /api/ai/voice/parse

**Назначение:** принять аудио, получить transcript и structured JSON для выбранного режима.

### Request
- Content-Type: `multipart/form-data`
- Fields:
  - `mode`: `"patient" | "visit" | "note"`
  - `language`: `"auto" | "hy" | "ru" | "en"` (по умолчанию auto)
  - `contextPatientId` (опционально): UUID (нужно для mode=visit/note)
  - `audio`: файл (webm/wav/ogg)

### Response (200)
```json
{
  "mode": "patient",
  "language": "auto",
  "transcript": "строка распознанного текста",
  "structured": { },
  "warnings": ["string"]
}
