/**
 * Mock data for Patient Card demo
 * - Sample patient with extended fields
 * - Sample visits
 * - Sample files
 * - Sample medications
 * - Sample finance data (payments, balance)
 */

import type { Patient, Visit, MedicalFile, Medication, PatientFinance, TreatmentStep } from '../types';

export const mockPatient: Patient = {
  id: '1',
  firstName: 'Анна',
  lastName: 'Петросян',
  phone: '+374 91 234 567',
  status: 'in_progress',
  lastVisitDate: '15 янв 2025',
  notes: 'Пациент с повышенной чувствительностью. Требуется осторожность при лечении верхних моляров.',
  dateOfBirth: '12.05.1985',
  segment: 'vip',
  diagnosis: 'Хронический генерализованный пародонтит средней степени тяжести. Множественный кариес. Частичная вторичная адентия верхней челюсти.',
};

export const mockVisits: Visit[] = [
  {
    id: '1',
    date: '15 янв 2025',
    summary: 'Осмотр, профессиональная чистка зубов. Выявлен кариес на 36 зубе.',
    nextVisitDate: '22 янв 2025',
  },
  {
    id: '2',
    date: '10 дек 2024',
    summary: 'Лечение пульпита 47 зуба. Установлена временная пломба.',
    nextVisitDate: '15 янв 2025',
  },
  {
    id: '3',
    date: '25 ноя 2024',
    summary: 'Первичный осмотр. Составлен план лечения.',
  },
];

export const mockFiles: MedicalFile[] = [
  {
    id: '1',
    name: 'Снимок верхней челюсти',
    type: 'xray',
    url: '/files/xray-1.jpg',
    uploadedAt: '15 янв 2025',
  },
  {
    id: '2',
    name: 'Фото до лечения',
    type: 'photo',
    url: '/files/photo-1.jpg',
    uploadedAt: '25 ноя 2024',
  },
  {
    id: '3',
    name: 'План лечения',
    type: 'document',
    url: '/files/plan.pdf',
    uploadedAt: '25 ноя 2024',
  },
];

export const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Амоксициллин',
    dosage: '500 мг, 3 раза в день, 7 дней',
    notes: 'Принимать после еды',
  },
  {
    id: '2',
    name: 'Ибупрофен',
    dosage: '400 мг, при болях',
    notes: 'Не более 3 раз в день',
  },
  {
    id: '3',
    name: 'Хлоргексидин 0.05%',
    dosage: 'Полоскание 2 раза в день',
  },
];

// Treatment Plan mock data
export const mockTreatmentSteps: TreatmentStep[] = [
  {
    id: 'step-1',
    name: 'Лечение кариеса 36',
    price: 25000,
    completed: false,
  },
  {
    id: 'step-2',
    name: 'Коронка 36',
    price: 120000,
    completed: false,
  },
  {
    id: 'step-3',
    name: 'Проф. чистка',
    price: 20000,
    completed: false,
  },
];

// Finance mock data
export const mockFinance: PatientFinance = {
  totalCost: 85000,
  payments: [
    {
      id: '1',
      date: '15 янв 2025',
      amount: 25000,
      description: 'Профессиональная чистка',
    },
    {
      id: '2',
      date: '10 дек 2024',
      amount: 35000,
      description: 'Лечение пульпита',
    },
    {
      id: '3',
      date: '25 ноя 2024',
      amount: 5000,
      description: 'Первичный осмотр',
    },
  ],
};
