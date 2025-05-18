import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { useToast } from './ToastContext'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  const fetchUser = async () => {
    try {
      // Try to get user via /me
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
        withCredentials: true,
      })
      setUser(res.data.user)
      localStorage.setItem('user', JSON.stringify(res.data.user))
    } catch (err) {
        console.error('Fetch user error:', err)  
        // showToast('User not logged in', 'error')
    } finally {
      setLoading(false)
    }
  }

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {}, {
        withCredentials: true,
      })
      showToast('Logged out successfully', 'success')
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      setUser(null)
      localStorage.removeItem('user')
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isLoggedIn: !!user,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
