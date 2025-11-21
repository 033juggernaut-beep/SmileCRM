# Supabase Manual Steps

1. **Открой SQL Editor**  
   - Перейди в [https://app.supabase.com](https://app.supabase.com), выбери нужный проект.  
   - В левой панели выбери `SQL Editor`, затем создавай новый запрос (`New query`).

2. **Вставь миграцию**  
   - Скопируй содержимое `backend/app/db/migrations/010_create_subscriptions_and_payments.sql`.  
   - Вставь текст в SQL Editor и нажми `Run` (или `Ctrl+Enter`), чтобы создать таблицы.

3. **Проверь результат**  
   - Открой `Table Editor` → убедись, что появились таблицы `subscriptions` и `payments`.  
   - Для каждой таблицы проверь список колонок, типы данных и внешние ключи на `doctors.id`.  
   - При необходимости добавь тестовые строки через `Insert row`, чтобы убедиться, что всё работает.


