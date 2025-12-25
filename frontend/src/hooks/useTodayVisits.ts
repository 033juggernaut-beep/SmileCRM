/**
 * useTodayVisits - Hook for fetching today's visits with auto-refresh
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { visitsApi, type TodayVisitsResponse, type Visit } from '../api/visits'

// Mock data for when API is unavailable
const mockTodayVisits: TodayVisitsResponse = {
  date: new Date().toISOString().split('T')[0],
  count: 3,
  visits: [
    {
      id: 'mock-1',
      patientId: 'p1',
      visitDate: new Date().toISOString().split('T')[0],
      visitTime: '09:30',
      status: 'scheduled',
      notes: 'Regular checkup',
      patient: {
        id: 'p1',
        firstName: 'Արdelays',
        lastName: 'Delaysdelays',
        phone: '+374 91 123 456',
      },
    },
    {
      id: 'mock-2',
      patientId: 'p2',
      visitDate: new Date().toISOString().split('T')[0],
      visitTime: '11:00',
      status: 'in_progress',
      notes: 'Tooth filling',
      patient: {
        id: 'p2',
        firstName: 'Мария',
        lastName: 'Иванова',
        phone: '+374 93 456 789',
      },
    },
    {
      id: 'mock-3',
      patientId: 'p3',
      visitDate: new Date().toISOString().split('T')[0],
      visitTime: '14:30',
      status: 'scheduled',
      patient: {
        id: 'p3',
        firstName: 'John',
        lastName: 'Smith',
        phone: '+1 555 123 4567',
      },
    },
  ],
}

interface UseTodayVisitsResult {
  visits: Visit[]
  count: number
  date: string
  isLoading: boolean
  error: string | null
  isMock: boolean
  refetch: () => Promise<void>
}

export function useTodayVisits(): UseTodayVisitsResult {
  const [visits, setVisits] = useState<Visit[]>([])
  const [count, setCount] = useState(0)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMock, setIsMock] = useState(false)
  
  const isMounted = useRef(true)

  const fetchVisits = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await visitsApi.getTodayVisits()
      
      if (!isMounted.current) return
      
      setVisits(response.visits)
      setCount(response.count)
      setDate(response.date)
      setIsMock(false)
    } catch (err) {
      if (!isMounted.current) return
      
      console.log('[useTodayVisits] API unavailable, using mock data:', err)
      
      // Use mock data as fallback
      setVisits(mockTodayVisits.visits)
      setCount(mockTodayVisits.count)
      setDate(mockTodayVisits.date)
      setIsMock(true)
      setError(null)
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    fetchVisits()
    
    return () => {
      isMounted.current = false
    }
  }, [fetchVisits])

  // Refetch on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (!isMock) {
        fetchVisits()
      }
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [isMock, fetchVisits])

  return {
    visits,
    count,
    date,
    isLoading,
    error,
    isMock,
    refetch: fetchVisits,
  }
}

export default useTodayVisits

