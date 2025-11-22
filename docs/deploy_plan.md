# Deploy Plan — Telegram Mini App на PaaS

## 1. Регистрация Mini App у BotFather

1. Открой чат с `@BotFather`.
2. Создай нового бота:
   - Команда `/newbot`.
   - Введи читаемое имя (например, `SmileCRM Bot`).
   - Введи уникальный username, оканчивающийся на `bot` (например, `smilecrm_bot`).
   - Сохрани токен (`TELEGRAM_BOT_TOKEN`) и сразу выпиши его в `.env`.
3. Настрой команды и меню (опционально):
   - `/setcommands` → выбери бота → введи список команд (например, `start - Launch mini app`).
4. Зарегистрируй Mini App:
   - `/setdomain` → выбери бота → введи домен фронтенда (например, `mini.smilecrm.com` или домен Vercel).
   - `/setinlinegeo` — пропусти (не требуется).
5. Укажи Web App URL:
   - `/setmenu` → выбери бота → `Web App`.
   - Введи название кнопки (например, `SmileCRM Mini App`).
   - URL указываем из фронтенда (https, например `https://smilecrm-web.vercel.app`).
   - Для локального теста можно временно указать `https://example.com`, но в проде обязательно HTTPS, иначе Telegram заблокирует кнопку.

## 2. Деплой фронтенда (Vercel или Netlify)

### Vercel
1. Зарегистрируй аккаунт на [vercel.com](https://vercel.com/) и подключи GitHub-репозиторий.
2. Создай новый проект:
   - Укажи корневую директорию `frontend/`.
   - Framework: `Vite`.
3. Настрой переменные окружения:
   - `VITE_API_BASE_URL=https://<backend-domain>` — публичный URL FastAPI.
   - `VITE_TELEGRAM_BOT_NAME=<username>` (если нужно).
4. Запусти деплой — Vercel сгенерирует домен вида `https://project.vercel.app`.
5. В BotFather обнови Web App URL на домен Vercel.

### Netlify (альтернатива)
1. Подключи репозиторий, выбери папку `frontend/`, билд-команду `npm run build`, publish-директорию `dist`.
2. Добавь те же переменные окружения.
3. Деплой → полученный HTTPS-URL так же укажи в настройках бота.

## 3. Деплой backend (Render или Railway)

### Render (FastAPI + aiogram)
1. Зарегистрируйся на [render.com](https://render.com/) и создай `Web Service`.
2. Репозиторий → директория `backend/`.
3. Настрой:
   - Runtime: Python 3.11+.
   - Build command: `pip install -r requirements.txt`.
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port 10000`.
4. Переменные окружения:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
   - `TELEGRAM_BOT_TOKEN`.
   - `FRONTEND_WEBAPP_URL` (https-домен фронтенда).
   - `WEBHOOK_URL=https://<render-service-name>.onrender.com`.
   - Любые прочие значения из `.env`.
5. Запусти сервис — получи HTTPS-домен `https://<service>.onrender.com`.

### Railway (альтернатива)
1. Создай `New Project` → `Deploy from GitHub`.
2. Укажи `backend/`, команду `pip install -r requirements.txt` и старт `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
3. Добавь те же переменные окружения.
4. Railway выдаст `https://<project>.up.railway.app`.

### Deploy backend на Render (детально)
1. В репозитории уже есть `render.yaml`. На Render можно выбрать **Blueprint** и указать этот файл, либо вручную создать Web Service:
   - Root directory: `backend`.
   - Build command: `pip install -r requirements.txt`.
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
2. Задай переменные окружения (см. `backend/.env.example`):
   - `TELEGRAM_BOT_TOKEN`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `FRONTEND_WEBAPP_URL=https://cerulean-sfogliatella-9f38c8.netlify.app`
   - `WEBHOOK_URL=https://<render-service>.onrender.com`
3. После деплоя проверь `https://<render-service>.onrender.com/health` и `https://<render-service>.onrender.com/docs`.
4. Обнови Netlify переменную `VITE_API_URL` этим Render URL, чтобы Telegram Mini App перестал обращаться к localhost.

## 4. Настройка webhook бота

1. В `.env` бекенда уже должен быть `WEBHOOK_URL=https://<backend-domain>`.
2. При старте FastAPI (см. `app.main`) бот автоматически вызовет `setWebhook` на `${WEBHOOK_URL}/bot/webhook`.
3. Если нужно вручную:
   - Отправь `POST https://api.telegram.org/bot<token>/setWebhook` c `url=https://<backend>/bot/webhook`.
4. Проверь, что в логах backend-а видно подтверждение Telegram (HTTP 200).

## 5. Проверка Mini App с реальным пользователем

1. Открой Telegram, перейди к боту → `/start`.
2. Убедись, что кнопки:
   - На HTTPS окружении открывают Mini App внутри Telegram.
   - На локальном (http://) бот отправляет текстовые ссылки (реализовано условиями Task 11).
3. Выполни сценарии:
   - `Գրանցվել` → открывает `...?page=register`.
   - Меню (пациенты, подписка) → соответствующие страницы.
4. Проверь `/api/subscription/create-payment` и другие API через Mini App.
5. При необходимости очисти кеш Telegram (`Settings → Advanced → Data & Storage → Clear All Cache`) перед повторным тестом.

## 6. Чек-лист переменных окружения

- **Frontend (Vercel/Netlify)**:
  - `VITE_API_BASE_URL`
  - `VITE_TELEGRAM_BOT_NAME` (если нужно)
- **Backend (Render/Railway)**:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `TELEGRAM_BOT_TOKEN`
  - `FRONTEND_WEBAPP_URL`
  - `WEBHOOK_URL`
  - `ENV=production`
- **Supabase**: убедись, что IP PaaS не блокируются и таблицы `doctors`, `patients`, `payments` созданы.

## 7. Финальная проверка

1. Зайди в Mini App через Telegram → пройди все экраны.
2. Создай тестового пациента, визит, попробуй оплату.
3. Проверь, что записи появляются в Supabase.
4. Обнови документацию с фактическими URL и токенами (без публикации секретов).
5. Перед прод-запуском включи мониторинг (Render Health Checks, Railway metrics).

Документ готов: следуя шагам, можно перевести проект из локальной разработки в боевой режим без Docker/ngrok, используя только PaaS.


