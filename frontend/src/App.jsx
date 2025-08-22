import { Link, Outlet } from 'react-router-dom'

export default function App() {
  const token = localStorage.getItem('token')

  return (
    <div>
      <nav style={{ padding: 12, borderBottom: '1px solid #eee' }}>
        <Link to="/todos" style={{ marginRight: 12 }}>Todos</Link>
        {!token && <Link to="/login">Login</Link>}
      </nav>
      <Outlet />
    </div>
  )
}
