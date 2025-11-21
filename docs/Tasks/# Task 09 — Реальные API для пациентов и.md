# Task 09 — Реальные API для пациентов и визитов

## Цель

Сделать рабочие API:

- `/patients` (CRUD)
- `/patients/{id}/visits` (список/создание)
- `/visits/{id}` (обновление)

---

## Что попросить сделать Cursor AI

> В `backend/app/api/patients.py` и `visits.py` реализуй следующие endpoints:
> 
> 1. `GET /patients`:
>    - Берёт `doctor_id` из токена (пока можно заглушку `doctor_id`).
>    - Возвращает список пациентов этого врача.
> 
> 2. `POST /patients`:
>    - Создаёт пациента, привязанного к врачу.
> 
> 3. `GET /patients/{patient_id}`:
>    - Детали пациента.
> 
> 4. `GET /patients/{patient_id}/visits`:
>    - Список визитов.
> 
> 5. `POST /patients/{patient_id}/visits`:
>    - Создаёт новый визит (дата, диагноз/заметки, следующий визит).
> 
> 6. `PATCH /visits/{visit_id}`:
>    - Обновление визита.
> 
> Используй Pydantic-схемы в `models/dto.py` и сервисы `patients_service` / `visits_service`.
> 
> Предусмотри базовую авторизацию через Bearer токен (пусть пока будет заглушка, но архитектура — как у настоящего).

---

## Что сделать самому

1. Связать frontend:
   - В `PatientsListPage` → `GET /patients`.
   - В `AddPatientPage` → `POST /patients`.
   - В `PatientDetailsPage`:
     - `GET /patients/{id}`
     - `GET /patients/{id}/visits`.
2. Проверить, что новые пациенты реально создаются в Supabase.

---

## Критерии готовности

- Врач видит в UI реальных пациентов из базы.
- Добавление пациента в UI → новая строка в Supabase.
