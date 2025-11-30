# 📋 Команды для обновления GitHub (PowerShell)

Откройте терминал в папке проекта и выполните эти команды **ПО ОДНОЙ**:

## Шаг 1: Проверить текущий статус

```powershell
cd "C:\Users\user\SmileCRM bot"
```

```powershell
git status
```

## Шаг 2: Добавить все изменения

```powershell
git add .
```

## Шаг 3: Проверить, что будет закоммичено

```powershell
git status
```

Вы должны увидеть список файлов (зеленым):
- frontend/src/components/MediaGallery.tsx
- frontend/src/api/media.ts
- frontend/src/pages/PatientDetailsPage.tsx
- backend/app/api/media.py
- backend/app/services/media_service.py
- backend/app/services/supabase_client.py
- backend/app/models/dto.py
- backend/app/db/migrations/011_create_media_files.sql
- и документация (.md файлы)

## Шаг 4: Создать коммит

```powershell
git commit -m "feat: Add media upload functionality for patient X-rays and photos"
```

## Шаг 5: Отправить на GitHub

```powershell
git push origin main
```

## Шаг 6: Проверить, что пуш прошел

```powershell
git log --oneline -n 3
```

Вы должны увидеть в самом верху:
```
XXXXXXX feat: Add media upload functionality for patient X-rays and photos
```

---

## ⚠️ Если возникнут ошибки:

### Ошибка: "Please tell me who you are"
```powershell
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Ошибка: "rejected"
```powershell
git pull origin main
git push origin main
```

---

## ✅ После успешного пуша:

1. Подождите **2-3 минуты** (Vercel задеплоит автоматически)
2. Откройте Telegram → @SmileCRM_bot
3. Зайдите в приложение
4. Перейдите на страницу любого пациента
5. Прокрутите вниз
6. Должна появиться секция "📷 Ավելացնել նկարը"

---

## 🔍 Как проверить статус деплоя:

Откройте:
https://github.com/033juggernaut-beep/SmileCRM/commits/main

Ваш коммит должен появиться в списке с зеленой галочкой ✅

