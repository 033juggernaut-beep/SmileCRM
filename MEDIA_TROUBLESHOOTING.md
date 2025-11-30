# Troubleshooting - Media Upload Not Showing

Если компонент загрузки медиа не отображается на странице пациента, проверьте следующее:

## 1. Проверьте, что страница прокручивается вниз

Компонент MediaGallery находится в самом низу страницы, после секции "История визитов". Прокрутите страницу вниз, чтобы увидеть его.

## 2. Проверьте консоль браузера

Откройте DevTools (F12) и проверьте консоль на наличие ошибок:
- Ошибки импорта компонентов
- Ошибки API (если медиафайлы не загружаются)
- Ошибки React

## 3. Проверьте, что все файлы созданы

Убедитесь, что существуют файлы:
- ✅ `frontend/src/components/MediaGallery.tsx`
- ✅ `frontend/src/api/media.ts`
- ✅ `backend/app/api/media.py`
- ✅ `backend/app/services/media_service.py`

## 4. Проверьте импорт в PatientDetailsPage

Убедитесь, что в файле `frontend/src/pages/PatientDetailsPage.tsx` есть:

```typescript
import { MediaGallery } from '../components/MediaGallery'
```

И внизу компонента:

```typescript
{/* Media Gallery Section */}
{id && <MediaGallery patientId={id} />}
```

## 5. Перезапустите dev-сервер

```bash
# Остановите текущий процесс (Ctrl+C)
cd frontend
npm run dev
```

## 6. Очистите кэш браузера

Нажмите Ctrl+Shift+R (или Cmd+Shift+R на Mac) для жесткой перезагрузки страницы.

## 7. Проверьте, применена ли миграция БД

Убедитесь, что вы выполнили SQL миграцию в Supabase:
1. Откройте Supabase Dashboard
2. Перейдите в SQL Editor
3. Выполните содержимое файла `backend/app/db/migrations/011_create_media_files.sql`

## 8. Проверьте, создан ли Storage bucket

1. Откройте Supabase Dashboard > Storage
2. Убедитесь, что существует bucket с именем "media"
3. Bucket должен быть приватным (не public)

## 9. Проверьте Network в DevTools

1. Откройте DevTools (F12) > Network
2. Обновите страницу
3. Найдите запрос GET `/api/patients/{id}/media`
4. Проверьте статус ответа (должен быть 200 или 401/403)

Если ответ 401/403 - проблема с авторизацией
Если ответ 404 - роутер не зарегистрирован
Если ответ 500 - ошибка на backend

## 10. Временное решение для отладки

Добавьте debug вывод в компонент MediaGallery:

```typescript
useEffect(() => {
  console.log('MediaGallery mounted, patientId:', patientId)
  void loadMediaFiles()
}, [patientId])
```

Это поможет понять, монтируется ли компонент вообще.

