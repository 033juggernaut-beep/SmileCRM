/**
 * Mock patient data for demonstration
 * - Realistic Russian names
 * - Various statuses and visit dates
 * - VIP and regular segments
 */

import type { Patient } from '../types';

export const mockPatients: Patient[] = [
  {
    id: '1',
    firstName: 'Анна',
    lastName: 'Петрова',
    phone: '9001234567',
    status: 'in_progress',
    lastVisit: new Date(2024, 11, 15),
    segment: 'vip',
  },
  {
    id: '2',
    firstName: 'Михаил',
    lastName: 'Сидоров',
    phone: '9012345678',
    status: 'completed',
    lastVisit: new Date(2024, 11, 10),
    segment: 'regular',
  },
  {
    id: '3',
    firstName: 'Елена',
    lastName: 'Козлова',
    phone: '9023456789',
    status: 'in_progress',
    lastVisit: new Date(2024, 11, 18),
    segment: 'vip',
  },
  {
    id: '4',
    firstName: 'Дмитрий',
    lastName: 'Новиков',
    phone: '9034567890',
    status: 'completed',
    lastVisit: new Date(2024, 10, 28),
    segment: 'regular',
  },
  {
    id: '5',
    firstName: 'Ольга',
    lastName: 'Морозова',
    phone: '9045678901',
    status: 'in_progress',
    lastVisit: new Date(2024, 11, 20),
    segment: 'vip',
  },
  {
    id: '6',
    firstName: 'Александр',
    lastName: 'Волков',
    phone: '9056789012',
    status: 'completed',
    lastVisit: new Date(2024, 10, 15),
    segment: 'regular',
  },
  {
    id: '7',
    firstName: 'Мария',
    lastName: 'Соколова',
    phone: '9067890123',
    status: 'in_progress',
    lastVisit: new Date(2024, 11, 22),
    segment: 'regular',
  },
  {
    id: '8',
    firstName: 'Сергей',
    lastName: 'Лебедев',
    phone: '9078901234',
    status: 'completed',
    lastVisit: new Date(2024, 9, 30),
    segment: 'vip',
  },
];
