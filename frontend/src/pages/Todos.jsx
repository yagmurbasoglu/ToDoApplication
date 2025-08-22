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
  const [isLight, setIsLight] = useState(() => localStorage.getItem('theme') === 'light')
  const [expandedId, setExpandedId] = useState(null)
  const [newLabel, setNewLabel] = useState('') // '', 'school', 'work', 'sport'
  const [newDescription, setNewDescription] = useState('')
  const [showAddDetails, setShowAddDetails] = useState(false)

  const readMetaMap = () => {
    try { return JSON.parse(localStorage.getItem('todoMeta') || '{}') } catch { return {} }
  }
  const writeMetaMap = (map) => {
    localStorage.setItem('todoMeta', JSON.stringify(map || {}))
  }
  const saveMeta = (id, data) => {
    const map = readMetaMap()
    map[id] = { ...(map[id] || {}), ...data }
    writeMetaMap(map)
  }
  const getMeta = (id) => readMetaMap()[id] || {}

  const fetchTodos = async () => {
    try {
      setLoading(true)
      const res = await api.get('/Todo')
      const list = res.data || []
      setTodos(list)
      // try to attach pending meta by title if backend didn't return id on creation
      const pendingRaw = localStorage.getItem('pendingMeta')
      if (pendingRaw) {
        try {
          const pending = JSON.parse(pendingRaw)
          const candidate = [...list].reverse().find((t) => t.title === pending.title && !getMeta(t.id)?.label && !getMeta(t.id)?.description)
          if (candidate) {
            saveMeta(candidate.id, { label: pending.label, description: pending.description })
            localStorage.removeItem('pendingMeta')
          }
        } catch { /* ignore */ }
      }
    } catch {
      setError('Todo listesi alınamadı.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('theme-light', isLight)
    }
  }, [isLight])

  const addTodo = async (e) => {
    e.preventDefault()
    if (!newTodo.trim()) return
    try {
      const res = await api.post('/Todo', { title: newTodo, isCompleted: false })
      const createdId = res?.data?.id || res?.data?.Id || res?.data?.todoId
      if (createdId) {
        if (newLabel || newDescription) saveMeta(createdId, { label: newLabel, description: newDescription })
      } else if (newLabel || newDescription) {
        localStorage.setItem('pendingMeta', JSON.stringify({ title: newTodo, label: newLabel, description: newDescription }))
      }
      setNewTodo('')
      setNewLabel('')
      setNewDescription('')
      setShowAddDetails(false)
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

  const logout = async () => {
    const confirmWithSweetAlert = async () => {
      try {
        if (!window.Swal) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js'
            script.async = true
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        }
        const result = await window.Swal.fire({
          title: 'Çıkış yapmak istediğine emin misin?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Evet, çıkış yap',
          cancelButtonText: 'İptal',
          confirmButtonColor: '#ef4444',
        })
        return result.isConfirmed
      } catch {
        return null
      }
    }

    let confirmed = await confirmWithSweetAlert()
    if (confirmed == null) {
      confirmed = window.confirm('Çıkış yapmak istediğine emin misin?')
    }
    if (!confirmed) return
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
      <button
        className="theme-toggle"
        onClick={() => {
          const next = !isLight
          setIsLight(next)
          localStorage.setItem('theme', next ? 'light' : 'dark')
        }}
        aria-label={isLight ? 'Gece moduna geç' : 'Açık moda geç'}
        title={isLight ? 'Gece moduna geç' : 'Açık moda geç'}
      >
        {isLight ? '🌙' : '☀️'}
      </button>
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
          <button type="button" className="btn btn-info" onClick={() => setShowAddDetails((v) => !v)}>
            {showAddDetails ? '− Detay' : '+ Detay'}
          </button>
          <button className="btn btn-primary">➕ Ekle</button>
        </form>

        {showAddDetails && (
          <div className="todo-add-details">
            <div className="label-picker">
              <button type="button" className={`chip ${newLabel === 'school' ? 'active school' : 'school'}`} onClick={() => setNewLabel(newLabel === 'school' ? '' : 'school')}>📚 Okul</button>
              <button type="button" className={`chip ${newLabel === 'work' ? 'active work' : 'work'}`} onClick={() => setNewLabel(newLabel === 'work' ? '' : 'work')}>💼 İş</button>
              <button type="button" className={`chip ${newLabel === 'sport' ? 'active sport' : 'sport'}`} onClick={() => setNewLabel(newLabel === 'sport' ? '' : 'sport')}>🏋 Spor</button>
            </div>
            <textarea
              rows={3}
              className="todo-input"
              placeholder="Açıklama (opsiyonel)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>
        )}

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
                  {/* Label chip */}
                  {(() => {
                    const meta = getMeta(todo.id)
                    const label = meta.label
                    if (!label) return null
                    const map = { school: '📚 Okul', work: '💼 İş', sport: '🏋 Spor' }
                    return <span className={`chip inline ${label}`}>{map[label]}</span>
                  })()}
                  <button onClick={() => setExpandedId(expandedId === todo.id ? null : todo.id)} className="btn btn-secondary" style={{ marginRight: 6 }}>{expandedId === todo.id ? '−' : '+'}</button>
                  <button onClick={() => startEdit(todo)} className="btn btn-info">✏️ Düzenle</button>
                  <button onClick={() => deleteTodo(todo.id)} className="btn btn-danger">❌ Sil</button>
                </>
              )}
              {expandedId === todo.id && (
                <div className="todo-detail">
                  
                  <p className="todo-desc">
                    {getMeta(todo.id).description || "Detay bilgisi yok"}
                  </p>
                
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
