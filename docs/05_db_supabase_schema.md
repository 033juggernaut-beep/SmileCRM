# Supabase – схема БД

## Таблицы

### doctors

- `id` (uuid, PK)
- `telegram_user_id` (bigint, unique)
- `first_name` (text)
- `last_name` (text)
- `specialization` (text)
- `phone` (text)
- `clinic_name` (text)
- `trial_started_at` (timestamptz)
- `trial_ends_at` (timestamptz)
- `subscription_status` (text)  # 'trial', 'active', 'expired'
- `subscription_ends_at` (timestamptz, nullable)
- `created_at` (timestamptz, default now())

### patients

- `id` (uuid, PK)
- `doctor_id` (uuid, FK → doctors.id)
- `first_name` (text)
- `last_name` (text)
- `diagnosis` (text)
- `phone` (text, nullable)
- `status` (text)  # 'in_progress', 'completed'
- `created_at` (timestamptz, default now())

### visits

- `id` (uuid, PK)
- `patient_id` (uuid, FK → patients.id)
- `doctor_id` (uuid, FK → doctors.id)
- `visit_date` (date)
- `next_visit_date` (date, nullable)
- `notes` (text)
- `created_at` (timestamptz, default now())

### media_files

- `id` (uuid, PK)
- `patient_id` (uuid, FK → patients.id)
- `doctor_id` (uuid, FK → doctors.id)
- `visit_id` (uuid, FK → visits.id, nullable)
- `file_path` (text)  # путь в Supabase Storage
- `file_type` (text)  # 'xray', 'photo', ...
- `created_at` (timestamptz, default now())

### subscriptions

- `id` (uuid, PK)
- `doctor_id` (uuid, FK → doctors.id)
- `status` (text)  # 'trial', 'active', 'canceled', 'expired'
- `trial_started_at` (timestamptz)
- `trial_ends_at` (timestamptz)
- `current_period_start` (timestamptz, nullable)
- `current_period_end` (timestamptz, nullable)
- `created_at` (timestamptz, default now())

### payments

- `id` (uuid, PK)
- `doctor_id` (uuid, FK → doctors.id)
- `provider` (text)  # 'idram', 'idbank'
- `external_payment_id` (text)
- `amount` (numeric)
- `currency` (text)  # 'AMD'
- `status` (text)  # 'pending', 'paid', 'failed'
- `created_at` (timestamptz, default now())
- `paid_at` (timestamptz, nullable)

## Логика триала

- При регистрации врача:
  - `trial_started_at = now()`
  - `trial_ends_at = now() + interval '7 days'`
  - `subscription_status = 'trial'`

- Проверка доступа:
  - Если сегодня <= trial_ends_at → доступ есть
  - Если есть активная запись в subscriptions со status 'active' и `current_period_end >= today` → доступ есть
  - Иначе → доступ закрыт, в Mini App показываем экран оплаты
