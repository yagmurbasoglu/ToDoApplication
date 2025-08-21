import { useState, useEffect } from 'react'
import api from '../services/api'
import './Todos.css'

export default function Todos() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [filter, setFilter] = useState('all')

  const fetchTodos = async () => {
    try {
      setLoading(true)
      const res = await api.get('/Todo')
      setTodos(res.data || [])
    } catch {
      setError('Todo listesi alınamadı.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  const addTodo = async (e) => {
    e.preventDefault()
    if (!newTodo.trim()) return
    try {
      await api.post('/Todo', { title: newTodo, isCompleted: false })
      setNewTodo('')
      fetchTodos()
    } catch {
      setError('Todo eklenemedi.')
    }
  }

  const toggleTodo = async (todo) => {
    try {
      await api.put(`/Todo/${todo.id}`, { ...todo, isCompleted: !todo.isCompleted })
      fetchTodos()
    } catch {
      setError('Todo güncellenemedi.')
    }
  }

  const deleteTodo = async (id) => {
    try {
      await api.delete(`/Todo/${id}`)
      fetchTodos()
    } catch {
      setError('Todo silinemedi.')
    }
  }

  const startEdit = (todo) => {
    setEditingId(todo.id)
    setEditTitle(todo.title)
  }

  const saveEdit = async (id) => {
    try {
      await api.put(`/Todo/${id}`, { title: editTitle, isCompleted: false })
      setEditingId(null)
      setEditTitle('')
      fetchTodos()
    } catch {
      setError('Todo düzenlenemedi.')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.isCompleted
    if (filter === 'completed') return todo.isCompleted
    return true
  })

  const totalCount = todos.length
  const completedCount = todos.filter((t) => t.isCompleted).length
  const activeCount = totalCount - completedCount

  return (
    <div className="todos-page">
      <div className="todos-container">
        {/* Üst bar */}
        <div className="todos-header">
          <h1 className="todos-title">📝 ToDo Uygulaması</h1>
          <button onClick={logout} className="btn btn-danger">🚪 Çıkış Yap</button>
        </div>

        {/* Görev sayacı */}
        <div className="todos-counter">
          <span>📌 <b>Toplam:</b> {totalCount}</span>
          <span className="completed">✅ <b>Tamamlanan:</b> {completedCount}</span>
          <span className="pending">⏳ <b>Kalan:</b> {activeCount}</span>
        </div>

        {/* Filtre butonları */}
        <div className="todos-filters">
          <button onClick={() => setFilter('all')} className={`btn btn-filter ${filter === 'all' ? 'active' : ''}`}>Hepsi</button>
          <button onClick={() => setFilter('active')} className={`btn btn-filter ${filter === 'active' ? 'active' : ''}`}>Aktif</button>
          <button onClick={() => setFilter('completed')} className={`btn btn-filter ${filter === 'completed' ? 'active' : ''}`}>Tamamlanan</button>
        </div>

        {/* Form */}
        <form onSubmit={addTodo} className="todo-form">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Yeni görev ekle..."
            className="todo-input"
          />
          <button className="btn btn-primary">➕ Ekle</button>
        </form>

        {loading && <p className="loading">Yükleniyor...</p>}
        {error && <p className="error">{error}</p>}

        {/* Liste */}
        <ul className="todo-list">
          {filteredTodos.map((todo, idx) => (
            <li key={todo.id} className="todo-item" style={{ animationDelay: `${idx * 60}ms` }}>
              {editingId === todo.id ? (
                <>
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="edit-input" />
                  <button onClick={() => saveEdit(todo.id)} className="btn btn-success">💾 Kaydet</button>
                  <button onClick={() => setEditingId(null)} className="btn btn-secondary">❌ İptal</button>
                </>
              ) : (
                <>
                  <span onClick={() => toggleTodo(todo)} className={`todo-title ${todo.isCompleted ? 'completed' : ''}`}>
                    {todo.title}
                  </span>
                  <button onClick={() => startEdit(todo)} className="btn btn-info">✏️ Düzenle</button>
                  <button onClick={() => deleteTodo(todo.id)} className="btn btn-danger">❌ Sil</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
