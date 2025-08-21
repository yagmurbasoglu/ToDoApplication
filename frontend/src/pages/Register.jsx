import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import './Register.css'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/User/register', { email, password })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data || err.message || 'Kayıt başarısız.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <h2 className="register-title">Kayıt Ol</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <label>Email</label>
          <div className="input-group">
            <span className="input-icon">📧</span>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>

          <label>Şifre</label>
          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
            <button type="button" className="toggle-btn" onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <button disabled={loading} className="btn btn-gradient">
            {loading ? 'Kayıt yapılıyor…' : 'Kayıt Ol'}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
        <p className="register-footer">
          Zaten hesabın var mı? <Link to="/login">Giriş yap</Link>
        </p>
      </div>
    </div>
  )
}
