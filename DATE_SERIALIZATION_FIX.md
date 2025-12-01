# 🔧 Fix: Date Serialization Error

## ❌ Проблема

```
TypeError: Object of type date is not JSON serializable
```

### Что происходило:

1. Frontend отправлял даты как строки: `"2025-12-05"` ✅
2. Pydantic (FastAPI) автоматически конвертировал строки в Python `date` объекты ✅
3. Backend пытался отправить `date` объекты в Supabase через JSON ❌
4. Python `date` объекты не могут быть сериализованы в JSON напрямую ❌

### Ошибка происходила в:
```python
File: backend/app/services/visits_service.py, line 20
inserted = supabase_client.insert("visits", body)
```

## ✅ Решение

Добавил функцию `_serialize_dates()` которая конвертирует Python `date/datetime` объекты в ISO формат строки перед отправкой в Supabase.

### Что изменилось:

#### До:
```python
def create_visit(doctor_id: str, patient_id: str, payload: Mapping[str, Any]) -> dict[str, Any]:
  body = {"doctor_id": doctor_id, "patient_id": patient_id, **payload}
  inserted = supabase_client.insert("visits", body)  # ❌ date objects fail here
  return inserted[0] if inserted else body
```

#### После:
```python
def _serialize_dates(data: dict[str, Any]) -> dict[str, Any]:
  """Convert date/datetime objects to ISO format strings for JSON serialization."""
  result = {}
  for key, value in data.items():
    if isinstance(value, datetime):
      result[key] = value.isoformat()  # "2025-12-05T10:30:00"
    elif isinstance(value, date):
      result[key] = value.isoformat()  # "2025-12-05"
    else:
      result[key] = value
  return result

def create_visit(doctor_id: str, patient_id: str, payload: Mapping[str, Any]) -> dict[str, Any]:
  body = {"doctor_id": doctor_id, "patient_id": patient_id, **payload}
  serialized_body = _serialize_dates(body)  # ✅ Convert dates to strings
  inserted = supabase_client.insert("visits", serialized_body)
  return inserted[0] if inserted else serialized_body
```

## 📝 Измененные файлы:

- `backend/app/services/visits_service.py` - Добавлена сериализация дат

## 🔄 Поток данных (Исправленный):

1. **Frontend** → `"2025-12-05"` (string)
2. **FastAPI/Pydantic** → `date(2025, 12, 5)` (Python date object)
3. **visits_service.py** → `"2025-12-05"` (string via `.isoformat()`) ✅ NEW!
4. **Supabase** → сохраняет как DATE в PostgreSQL ✅

## 🚀 Деплой

```bash
git add backend/app/services/visits_service.py
git commit -m "fix: Serialize date objects to ISO strings before Supabase insert"
git push origin main
```

Render автоматически задеплоит за 3-5 минут.

## ✅ После деплоя

Создание визитов должно работать! Визиты будут успешно сохраняться в базу данных.

### Тест:
1. Откройте пациента в приложении
2. Заполните форму создания визита
3. Нажмите "Добавить визит"
4. Визит должен успешно создаться! 🎉

## 🎓 Урок

**Проблема**: Pydantic автоматически конвертирует типы (что хорошо для валидации), но эти Python объекты не всегда JSON-serializable.

**Решение**: Всегда конвертировать `date`/`datetime` объекты в строки перед отправкой в API/БД.

**Альтернативные решения**:
1. Использовать `.dict()` с параметром `mode='json'` (Pydantic v2)
2. Использовать custom JSON encoder
3. Хранить даты как строки везде (не рекомендуется)

**Выбранное решение**: Явная сериализация в service layer - самое чистое и понятное.

