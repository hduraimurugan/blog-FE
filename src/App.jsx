import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext.jsx'
import { ProtectedRoute } from './routes/ProtectedRoutes.jsx'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { ProfilePage } from './pages/ProfilePage'
import HomePage from './pages/HomePage.jsx'
import BlogsPage from './pages/BlogsPage.jsx'
import CreateBlogPage from './pages/CreateBlogPage.jsx'


function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="">
          <Router>
            <Routes>
              <Route element={
                <Layout />
              }>
                <Route path="/" element={<HomePage />} /> {/* Random or Free COntent */}
                <Route path="/login" element={<LoginPage />} />
              </Route>

              <Route element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>

                <Route path="/create-post" element={<CreateBlogPage />} />
                <Route path="/blogs" element={<BlogsPage />} /> {/* All Blogs Page */}
                <Route path="/blogs/:id" element={<BlogsPage />} /> {/* Blogs Page */}

                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />

              {/* Alternative custom 404 page */}
              {/* <Route path="*" element={<NotFoundPage />} /> */}

            </Routes>
          </Router>
        </div>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App