import { apiClient, buildAuthHeaders } from './client'
import { TOKEN_STORAGE_KEY } from '../constants/storage'

export const PATIENT_STATUSES = [
  { value: 'in_progress', label: 'Վերաբերման մեջ' },
  { value: 'completed', label: 'Ավարտված' },
] as const

export type PatientStatus = (typeof PATIENT_STATUSES)[number]['value']

export type Patient = {
  id: string
  firstName: string
  lastName: string
  diagnosis: string
  phone?: string
  status?: PatientStatus
  doctorId?: string
  createdAt?: string
}

export type Visit = {
  id: string
  doctorId?: string
  patientId: string
  visitDate: string
  nextVisitDate?: string
  notes?: string
  createdAt?: string
}

export type CreatePatientInput = {
  firstName: string
  lastName: string
  diagnosis: string
  phone?: string
  status?: PatientStatus
}

export type CreateVisitInput = {
  visitDate: string
  nextVisitDate?: string
  notes?: string
}

export type UpdateVisitInput = {
  visitDate?: string
  nextVisitDate?: string
  notes?: string
}

type ApiPatient = {
  id: string
  first_name: string
  last_name: string
  diagnosis: string
  phone?: string | null
  status?: string | null
  doctor_id?: string | null
  created_at?: string
}

type ApiVisit = {
  id: string
  doctor_id?: string | null
  patient_id: string
  visit_date: string
  next_visit_date?: string | null
  notes?: string | null
  created_at?: string
}

const getAuthTokenOrThrow = () => {
  if (typeof window === 'undefined') {
    throw new Error('Окружение браузера недоступно')
  }
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (!token) {
    throw new Error('Требуется повторная авторизация в Mini App')
  }
  return token
}

const isKnownStatus = (value: string | null | undefined): value is PatientStatus =>
  Boolean(value && PATIENT_STATUSES.some((option) => option.value === value))

const mapPatient = (data: ApiPatient): Patient => ({
  id: data.id,
  firstName: data.first_name,
  lastName: data.last_name,
  diagnosis: data.diagnosis,
  phone: data.phone ?? undefined,
  status: isKnownStatus(data.status) ? data.status : undefined,
  doctorId: data.doctor_id ?? undefined,
  createdAt: data.created_at,
})

const mapVisit = (data: ApiVisit): Visit => ({
  id: data.id,
  doctorId: data.doctor_id ?? undefined,
  patientId: data.patient_id,
  visitDate: data.visit_date,
  nextVisitDate: data.next_visit_date ?? undefined,
  notes: data.notes ?? undefined,
  createdAt: data.created_at,
})

const buildPatientPayload = (payload: CreatePatientInput) => ({
  first_name: payload.firstName,
  last_name: payload.lastName,
  diagnosis: payload.diagnosis,
  phone: payload.phone,
  status: payload.status,
})

const buildVisitPayload = (payload: CreateVisitInput | UpdateVisitInput) => {
  const body: Record<string, string | undefined> = {
    visit_date: payload.visitDate,
    next_visit_date: payload.nextVisitDate,
    notes: payload.notes,
  }

  return Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== undefined && value !== ''),
  )
}

export const patientsApi = {
  async list(): Promise<Patient[]> {
    const authToken = getAuthTokenOrThrow()
    const { data } = await apiClient.get<ApiPatient[]>('/api/patients', {
      headers: buildAuthHeaders(authToken),
    })
    return Array.isArray(data) ? data.map(mapPatient) : []
  },

  async create(payload: CreatePatientInput): Promise<Patient> {
    const authToken = getAuthTokenOrThrow()
    const { data } = await apiClient.post<ApiPatient>(
      '/api/patients',
      buildPatientPayload(payload),
      { headers: buildAuthHeaders(authToken) },
    )
    return mapPatient(data)
  },

  async getById(patientId: string): Promise<Patient> {
    const authToken = getAuthTokenOrThrow()
    const { data } = await apiClient.get<ApiPatient>(`/api/patients/${patientId}`, {
      headers: buildAuthHeaders(authToken),
    })
    return mapPatient(data)
  },

  async getVisits(patientId: string): Promise<Visit[]> {
    const authToken = getAuthTokenOrThrow()
    const { data } = await apiClient.get<ApiVisit[]>(
      `/api/patients/${patientId}/visits`,
      { headers: buildAuthHeaders(authToken) },
    )
    return Array.isArray(data) ? data.map(mapVisit) : []
  },

  async createVisit(patientId: string, payload: CreateVisitInput): Promise<Visit> {
    const authToken = getAuthTokenOrThrow()
    const { data } = await apiClient.post<ApiVisit>(
      `/api/patients/${patientId}/visits`,
      buildVisitPayload(payload),
      { headers: buildAuthHeaders(authToken) },
    )
    return mapVisit(data)
  },

  async updateVisit(visitId: string, payload: UpdateVisitInput): Promise<Visit> {
    const authToken = getAuthTokenOrThrow()
    const { data } = await apiClient.patch<ApiVisit>(
      `/api/visits/${visitId}`,
      buildVisitPayload(payload),
      { headers: buildAuthHeaders(authToken) },
    )
    return mapVisit(data)
  },
}


