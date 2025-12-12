import { apiClient, buildAuthHeaders } from './client'
import { getAuthToken } from './auth'

export type SubscriptionStatus = 'trial' | 'active' | 'expired'

export type SubscriptionSnapshot = {
  status: SubscriptionStatus
  trialEndsAt: string | null
  currentPeriodEnd: string | null
}

export type PaymentProvider = 'idram' | 'idbank'

type SubscriptionApiResponse = {
  status: SubscriptionStatus
  trialEndsAt: string | null
  currentPeriodEnd: string | null
}

type CreatePaymentApiResponse = {
  paymentUrl: string
}

const DEFAULT_PAYMENT_AMOUNT_AMD = 15000
const DEFAULT_PAYMENT_CURRENCY = 'AMD'

export const getSubscription = async (): Promise<SubscriptionSnapshot> => {
  const authToken = getAuthToken()
  const { data } = await apiClient.get<SubscriptionApiResponse>('/subscription', {
    headers: buildAuthHeaders(authToken),
  })
  return {
    status: data.status,
    trialEndsAt: data.trialEndsAt,
    currentPeriodEnd: data.currentPeriodEnd,
  }
}

export const createPayment = async (
  provider: PaymentProvider = 'idram',
): Promise<CreatePaymentApiResponse> => {
  const authToken = getAuthToken()

  const { data } = await apiClient.post<CreatePaymentApiResponse>(
    '/subscription/create-payment',
    {
      provider,
      amount: DEFAULT_PAYMENT_AMOUNT_AMD,
      currency: DEFAULT_PAYMENT_CURRENCY,
    },
    { headers: buildAuthHeaders(authToken) },
  )
  return data
}
