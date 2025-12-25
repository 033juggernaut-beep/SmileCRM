/**
 * Statistics API Client
 * 
 * Provides methods for fetching clinic statistics.
 */

import { apiClient, buildAuthHeaders } from './client'
import { getAuthToken } from './auth'

export type VisitSeriesPoint = {
  date: string
  count: number
}

export type StatsOverview = {
  // Patients
  patients_total: number
  patients_active: number
  patients_vip: number
  
  // Visits
  visits_total: number
  visits_today: number
  visits_last_7d: number
  visits_last_30d: number
  
  // Finance (AMD)
  finance_today_income_amd: number
  finance_month_income_amd: number
  finance_month_expense_amd: number
  
  // Chart series
  visits_series: VisitSeriesPoint[]
}

export type StatsRange = '7d' | '30d'

export const statsApi = {
  /**
   * Get statistics overview for the current doctor
   * @param range - '7d' or '30d' for the visits chart period
   */
  async getOverview(range: StatsRange = '7d'): Promise<StatsOverview> {
    const authToken = getAuthToken()
    const { data } = await apiClient.get<StatsOverview>('/statistics/overview', {
      headers: buildAuthHeaders(authToken),
      params: { range },
    })
    return data
  },
}

export default statsApi

