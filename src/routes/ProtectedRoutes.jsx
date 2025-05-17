import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UnauthorizedPage } from '../pages/UnauthorizedPage'
import { LoadingPage } from '../pages/LoadingPage'
import { useToast } from '../context/ToastContext'

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const { showToast } = useToast()

  if (loading) {
    return <LoadingPage />
  }

  if (!user) {
    // showToast("Please login first.", "error")
    return <Navigate to="/login" replace />
  }

  return children
}
