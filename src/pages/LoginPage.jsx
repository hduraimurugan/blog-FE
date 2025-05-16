// src/pages/LoginPage.jsx
import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import axios from 'axios'

export const LoginPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams();

  const { login } = useAuth()
  const { showToast } = useToast()

  // Get the tab from the query param
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState(tabParam === "signup" ? "signup" : "login"); // fallback to 'login'

  // Optionally, sync tab state when query changes
  useEffect(() => {
    if (tabParam && tabParam !== tab) {
      setTab(tabParam);
    }
  }, [tabParam]);

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (tab === 'login') {
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
          email, password
        }, { withCredentials: true })

        login(res.data.user)
        showToast('Login successful', 'success')
        navigate('/')
      } else {
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/signup`, {
          name, email, password
        }, { withCredentials: true })

        showToast('Signup successful, Continue Login', 'success')
        setTab('login')
        setName('')
      }
    } catch (err) {
      const msg = err?.response?.data?.message || `${tab === 'login' ? 'Login' : 'Signup'} failed`
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[61vh] flex items-center justify-center p-10">
      <div className="card w-full max-w-md shadow-2xl bg-white border border-gray-200">
        <div className="card-body px-8 py-10">

          {/* Logo */}
          <div className="text-center mb-6">
            <Link to="/" className="flex justify-center items-center">
              <span className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                Insight<span className="font-light">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 mt-2">
              {tab === 'login' ? 'Sign in to write Blogs & more' : 'Create an account to get started'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <button
              className={`px-4 py-2 cursor-pointer font-medium ${tab === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setTab('login')}
            >
              Login
            </button>
            <button
              className={`px-4 py-2 cursor-pointer font-medium ${tab === 'signup' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setTab('signup')}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {tab === 'signup' && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Full Name</span>
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="input input-bordered w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email Address</span>
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? (tab === 'login' ? 'Signing In...' : 'Creating Account...') : (tab === 'login' ? 'Login' : 'Sign Up')}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center mt-6 text-xs opacity-70">
            <p>Need help? <a href="#" className="link link-hover text-primary">Contact Support</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}
