import React, { useState } from 'react'
import styles from '../styles/Login.module.css'    // reuse the login CSS
import { supabase } from '../utils/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function SignUpPage() {
  const [hotelName, setHotelName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // 1) create the user
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password
    })
    if (authErr) {
      setError(authErr.message)
      return
    }

    // 2) insert your hotel profile
    //    adjust the profile table & fields as needed
    const { error: profileErr } = await supabase
      .from('profiles')
      .insert([{ 
        id: authData.user.id,
        hotel_name: hotelName,
        // you may need to generate or pass a hotel_id here
      }])
    if (profileErr) {
      setError(profileErr.message)
      return
    }

    // 3) navigate into the app
    navigate('/dashboard')
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <h1 className={styles.title}>Create Hotel Account</h1>

        <input
          type="text"
          placeholder="Hotel Name"
          value={hotelName}
          onChange={e => setHotelName(e.target.value)}
          className={styles.input}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={styles.input}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className={styles.input}
          required
        />

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.loginBtn}>
          Sign Up
        </button>

        <p className={styles.signup}>
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  )
}
