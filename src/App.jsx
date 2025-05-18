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
import SingleBlogPage from './pages/SingleBlogPage.jsx'
import EditBlogPage from './pages/EditBlogPage.jsx'
import Bookmarks from './pages/Bookmarks.jsx'
import Notifications from './pages/Notifications.jsx'


function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="">
          <Router>
            <Routes>
              <Route element={
                <Layout />
              }>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
              </Route>

              <Route element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>

                <Route path="/create-post" element={<CreateBlogPage />} />
                <Route path="/edit/:id" element={<EditBlogPage />} />

                <Route path="/blogs" element={<BlogsPage />} />
                <Route path="/blog/:id" element={<SingleBlogPage />} />

                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />

              {/* Alternative custom 404 page */}
              {/* <Route path="*" element={<NotFoundPage />} /> */}

            </Routes>
          </Router>
        </div>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App