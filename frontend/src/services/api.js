import axios from 'axios'

const api = axios.create({
  baseURL: '/api', // Vite proxy ile backend'e yönlenecek
})

// Token'i header'a ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
