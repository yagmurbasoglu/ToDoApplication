import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App'
import Login from './pages/Login'
import Todos from './pages/Todos'
import Register from './pages/Register'
import './index.css'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const token = localStorage.getItem('token')
  return !token ? children : <Navigate to="/todos" replace />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          {/* İlk açılış login sayfası */}
          <Route index element={<Navigate to="/login" replace />} />

          {/* Public sayfalar (sadece token YOKSA erişilebilir) */}
          <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Protected sayfalar (sadece token VARSA erişilebilir) */}
          <Route path="todos" element={<ProtectedRoute><Todos /></ProtectedRoute>} />

          {/* Diğer her şey todos'a yönlendirilsin */}
          <Route path="*" element={<Navigate to="/todos" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
