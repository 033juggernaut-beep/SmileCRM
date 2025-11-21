import { TOKEN_STORAGE_KEY } from '../constants/storage'
import { apiClient } from './client'

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

const getAuthTokenOrThrow = () => {
  if (typeof window === 'undefined') {
    throw new Error('Բրաուզերի միջավայրը հասանելի չէ')
  }

  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (!token) {
    throw new Error('Պահանջվում է նորից մուտք գործել Mini App')
  }

  return token
}

export const getSubscription = async (): Promise<SubscriptionSnapshot> => {
  const authToken = getAuthTokenOrThrow()
  const response = await apiClient.get<SubscriptionApiResponse>('/api/subscription', {
    authToken,
  })
  return {
    status: response.status,
    trialEndsAt: response.trialEndsAt,
    currentPeriodEnd: response.currentPeriodEnd,
  }
}

export const createPayment = async (
  provider: PaymentProvider = 'idram',
): Promise<CreatePaymentApiResponse> => {
  const authToken = getAuthTokenOrThrow()

  return apiClient.post<CreatePaymentApiResponse>(
    '/api/subscription/create-payment',
    {
      provider,
      amount: DEFAULT_PAYMENT_AMOUNT_AMD,
      currency: DEFAULT_PAYMENT_CURRENCY,
    },
    { authToken },
  )
}


