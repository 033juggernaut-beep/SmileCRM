import { apiClient, buildAuthHeaders } from './client'
import { TOKEN_STORAGE_KEY } from '../constants/storage'

export type PatientPayment = {
  id: string
  patientId: string
  doctorId: string
  visitId?: string | null
  amount: number
  currency: string
  paidAt: string
  comment?: string | null
  createdAt?: string
}

export type PatientFinanceSummary = {
  treatmentPlanTotal: number | null
  treatmentPlanCurrency: string
  totalPaid: number
  remaining: number | null
}

export type CreatePatientPaymentInput = {
  amount: number
  comment?: string
  visitId?: string
}

type ApiPatientPayment = {
  id: string
  patient_id: string
  doctor_id: string
  visit_id?: string | null
  amount: number
  currency: string
  paid_at: string
  comment?: string | null
  created_at?: string
}

type ApiPatientFinanceSummary = {
  treatment_plan_total: number | null
  treatment_plan_currency: string
  total_paid: number
  remaining: number | null
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

const mapPayment = (data: ApiPatientPayment): PatientPayment => ({
  id: data.id,
  patientId: data.patient_id,
  doctorId: data.doctor_id,
  visitId: data.visit_id ?? undefined,
  amount: data.amount,
  currency: data.currency,
  paidAt: data.paid_at,
  comment: data.comment ?? undefined,
  createdAt: data.created_at,
})

const mapFinanceSummary = (data: ApiPatientFinanceSummary): PatientFinanceSummary => ({
  treatmentPlanTotal: data.treatment_plan_total,
  treatmentPlanCurrency: data.treatment_plan_currency,
  totalPaid: data.total_paid,
  remaining: data.remaining,
})

const buildPaymentPayload = (payload: CreatePatientPaymentInput) => {
  const body: Record<string, unknown> = {
    amount: payload.amount,
  }
  
  // Only include comment if it has a value
  if (payload.comment) {
    body.comment = payload.comment
  }
  
  // Only include visit_id if it has a value
  if (payload.visitId) {
    body.visit_id = payload.visitId
  }
  
  return body
}

export const patientFinanceApi = {
  async listPayments(patientId: string): Promise<PatientPayment[]> {
    const authToken = getAuthTokenOrThrow()
    const { data } = await apiClient.get<ApiPatientPayment[]>(
      `/patients/${patientId}/payments`,
      { headers: buildAuthHeaders(authToken) },
    )
    return Array.isArray(data) ? data.map(mapPayment) : []
  },

  async createPayment(
    patientId: string,
    payload: CreatePatientPaymentInput,
  ): Promise<PatientPayment> {
    const authToken = getAuthTokenOrThrow()
    const { data } = await apiClient.post<ApiPatientPayment>(
      `/patients/${patientId}/payments`,
      buildPaymentPayload(payload),
      { headers: buildAuthHeaders(authToken) },
    )
    return mapPayment(data)
  },

  async getFinanceSummary(patientId: string): Promise<PatientFinanceSummary> {
    const authToken = getAuthTokenOrThrow()
    const { data } = await apiClient.get<ApiPatientFinanceSummary>(
      `/patients/${patientId}/finance-summary`,
      { headers: buildAuthHeaders(authToken) },
    )
    return mapFinanceSummary(data)
  },

  async deletePayment(patientId: string, paymentId: string): Promise<void> {
    const authToken = getAuthTokenOrThrow()
    await apiClient.delete(`/patients/${patientId}/payments/${paymentId}`, {
      headers: buildAuthHeaders(authToken),
    })
  },
}

