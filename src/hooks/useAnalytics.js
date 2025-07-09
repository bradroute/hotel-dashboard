// src/hooks/useAnalytics.js
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

/**
 * Custom hook to fetch analytics scoped by hotel_id.
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 */
export function useAnalytics(startDate, endDate) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      try {
        // Ensure authenticated
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Fetch user's profile to get hotel_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('hotel_id')
          .eq('id', user.id)
          .single()
        if (!profile) throw new Error('Profile not found')

        const hotelId = profile.hotel_id

        // Extend endDate by one day to include the full current day
        const endApi = new Date(endDate)
        endApi.setDate(endApi.getDate() + 1)
        const endParam = endApi.toISOString().slice(0, 10)

        // Build URL with required query params
        const urlObj = new URL(`${process.env.REACT_APP_API_URL}/analytics/full`)
        urlObj.searchParams.append('hotel_id', hotelId)
        urlObj.searchParams.append('startDate', startDate)
        urlObj.searchParams.append('endDate', endParam)
        const url = urlObj.toString()

        const res = await fetch(url)
        if (!res.ok) {
          const text = await res.text()
          throw new Error(`Analytics API ${res.status}: ${text}`)
        }

        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [startDate, endDate])

  return { data, loading, error }
}