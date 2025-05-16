import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UnauthorizedPage } from '../pages/UnauthorizedPage'
import { LoadingPage } from '../pages/LoadingPage'

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingPage />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
