import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import './Login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLight, setIsLight] = useState(() => localStorage.getItem('theme') === 'light')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/User/login', { email, password })
      const token = res.data?.token || res.data?.accessToken || res.data
      if (!token) throw new Error('Token bulunamadı.')

      localStorage.setItem('token', token)
      navigate('/todos')
    } catch (err) {
      setError(err.response?.data || err.message || 'Giriş başarısız.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <button
        className="theme-toggle"
        onClick={() => {
          const next = !isLight
          setIsLight(next)
          localStorage.setItem('theme', next ? 'light' : 'dark')
          if (typeof document !== 'undefined') {
            document.body.classList.toggle('theme-light', next)
          }
        }}
        aria-label={isLight ? 'Gece moduna geç' : 'Açık moda geç'}
        title={isLight ? 'Gece moduna geç' : 'Açık moda geç'}
      >
        {isLight ? '🌙' : '☀️'}
      </button>
      <div className="login-card">
        <h2 className="login-title">Giriş Yap</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <label>Email</label>
          <div className="input-group">
            <span className="input-icon">📧</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="Email adresiniz"
            />
          </div>

          <label>Şifre</label>
          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Şifreniz"
            />
            <button type="button" className="toggle-btn" onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <label className="checkbox-row">
            <input type="checkbox" /> Beni Hatırla
          </label>

          <button disabled={loading} className="btn btn-gradient">
            {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
        <p className="login-footer">
          Hesabın yok mu? <Link to="/register">Kayıt ol</Link>
        </p>
      </div>
    </div>
  )
}
