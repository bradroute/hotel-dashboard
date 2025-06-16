import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

export function useAnalytics(startDate, endDate) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data: profile } = await supabase
          .from('profiles')
          .select('hotel_id')
          .eq('id', user.id)
          .single()
        if (!profile) throw new Error('Profile not found')

        const hotelId = profile.hotel_id

        const url = `${process.env.REACT_APP_API_URL}/analytics/full?hotelId=${hotelId}&startDate=${startDate}&endDate=${endDate}`
        const res = await fetch(url)
        if (!res.ok) throw new Error('API error')
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
