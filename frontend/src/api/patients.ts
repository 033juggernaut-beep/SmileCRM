import { apiClient, buildAuthHeaders } from './client'
import { getAuthToken } from './auth'

export const PATIENT_STATUSES = [
  { value: 'in_progress', label: 'Վերաբերման մեջ' },
  { value: 'completed', label: 'Ավարտված' },
] as const

export type PatientStatus = (typeof PATIENT_STATUSES)[number]['value']

export type PatientSegment = 'regular' | 'vip'

export type Patient = {
  id: string
  firstName: string
  lastName: string
  diagnosis?: string | null
  phone?: string
  status?: PatientStatus
  segment?: PatientSegment
  doctorId?: string
  createdAt?: string
  birthDate?: string | null
  treatmentPlanTotal?: number | null
  treatmentPlanCurrency?: string | null
  marketingOptIn?: boolean | null
}

export type Visit = {
  id: string
  doctorId?: string
  patientId: string
  visitDate: string
  nextVisitDate?: string
  notes?: string
  medications?: string | null
  createdAt?: string
}

export type CreatePatientInput = {
  firstName: string
  lastName: string
  diagnosis?: string
  phone?: string
  status?: PatientStatus
  segment?: PatientSegment
  birthDate?: string
  treatmentPlanTotal?: number
  treatmentPlanCurrency?: string
}

export type CreateVisitInput = {
  visitDate: string
  nextVisitDate?: string
  notes?: string
  medications?: string
}

export type UpdateVisitInput = {
  visitDate?: string
  nextVisitDate?: string
  notes?: string
  medications?: string
}

type ApiPatient = {
  id: string
  first_name: string
  last_name: string
  diagnosis?: string | null
  phone?: string | null
  status?: string | null
  segment?: string | null
  doctor_id?: string | null
  created_at?: string
  birth_date?: string | null
  treatment_plan_total?: number | null
  treatment_plan_currency?: string | null
  marketing_opt_in?: boolean | null
}

type ApiVisit = {
  id: string
  doctor_id?: string | null
  patient_id: string
  visit_date: string
  next_visit_date?: string | null
  notes?: string | null
  medications?: string | null
  created_at?: string
}

const isKnownStatus = (value: string | null | undefined): value is PatientStatus =>
  Boolean(value && PATIENT_STATUSES.some((option) => option.value === value))

const isKnownSegment = (value: string | null | undefined): value is PatientSegment =>
  Boolean(value && ['regular', 'vip'].includes(value))

const mapPatient = (data: ApiPatient): Patient => ({
  id: data.id,
  firstName: data.first_name,
  lastName: data.last_name,
  diagnosis: data.diagnosis ?? undefined,
  phone: data.phone ?? undefined,
  status: isKnownStatus(data.status) ? data.status : undefined,
  segment: isKnownSegment(data.segment) ? data.segment : 'regular',
  doctorId: data.doctor_id ?? undefined,
  createdAt: data.created_at,
  birthDate: data.birth_date ?? undefined,
  treatmentPlanTotal: data.treatment_plan_total ?? undefined,
  treatmentPlanCurrency: data.treatment_plan_currency ?? undefined,
  marketingOptIn: data.marketing_opt_in ?? undefined,
})

const mapVisit = (data: ApiVisit): Visit => ({
  id: data.id,
  doctorId: data.doctor_id ?? undefined,
  patientId: data.patient_id,
  visitDate: data.visit_date,
  nextVisitDate: data.next_visit_date ?? undefined,
  notes: data.notes ?? undefined,
  medications: data.medications ?? undefined,
  createdAt: data.created_at,
})

const buildPatientPayload = (payload: CreatePatientInput) => ({
  first_name: payload.firstName,
  last_name: payload.lastName,
  diagnosis: payload.diagnosis,
  phone: payload.phone,
  status: payload.status,
  segment: payload.segment,
  birth_date: payload.birthDate,
  treatment_plan_total: payload.treatmentPlanTotal,
  treatment_plan_currency: payload.treatmentPlanCurrency,
})

const buildVisitPayload = (payload: CreateVisitInput | UpdateVisitInput) => {
  const body: Record<string, string | undefined> = {
    visit_date: payload.visitDate,
    next_visit_date: payload.nextVisitDate,
    notes: payload.notes,
    medications: payload.medications,
  }

  return Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== undefined && value !== ''),
  )
}

export const patientsApi = {
  async list(): Promise<Patient[]> {
    const authToken = getAuthToken()
    const { data } = await apiClient.get<ApiPatient[]>('/patients', {
      headers: buildAuthHeaders(authToken),
    })
    return Array.isArray(data) ? data.map(mapPatient) : []
  },

  async create(payload: CreatePatientInput): Promise<Patient> {
    const authToken = getAuthToken()
    const { data } = await apiClient.post<ApiPatient>(
      '/patients',
      buildPatientPayload(payload),
      { headers: buildAuthHeaders(authToken) },
    )
    return mapPatient(data)
  },

  async getById(patientId: string): Promise<Patient> {
    const authToken = getAuthToken()
    const { data } = await apiClient.get<ApiPatient>(`/patients/${patientId}`, {
      headers: buildAuthHeaders(authToken),
    })
    return mapPatient(data)
  },

  async getVisits(patientId: string): Promise<Visit[]> {
    const authToken = getAuthToken()
    const { data } = await apiClient.get<ApiVisit[]>(
      `/patients/${patientId}/visits`,
      { headers: buildAuthHeaders(authToken) },
    )
    return Array.isArray(data) ? data.map(mapVisit) : []
  },

  async createVisit(patientId: string, payload: CreateVisitInput): Promise<Visit> {
    const authToken = getAuthToken()
    const { data } = await apiClient.post<ApiVisit>(
      `/patients/${patientId}/visits`,
      buildVisitPayload(payload),
      { headers: buildAuthHeaders(authToken) },
    )
    return mapVisit(data)
  },

  async updateVisit(visitId: string, payload: UpdateVisitInput): Promise<Visit> {
    const authToken = getAuthToken()
    const { data } = await apiClient.patch<ApiVisit>(
      `/visits/${visitId}`,
      buildVisitPayload(payload),
      { headers: buildAuthHeaders(authToken) },
    )
    return mapVisit(data)
  },
}


