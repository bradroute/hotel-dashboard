// src/pages/LoginPage.jsx
import React, { useState } from 'react'
import styles from '../styles/Login.module.css'
import { supabase } from '../utils/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Remove unused `data` variable
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authErr) {
      setError(authErr.message)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <h1 className={styles.title}>Hotel Operations Login</h1>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={styles.input}
          required
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className={styles.input}
          required
        />

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.loginBtn}>
          Login
        </button>

        <p className={styles.signup}>
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
      </form>
    </div>
  )
}
