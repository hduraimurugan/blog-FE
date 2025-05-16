// src/pages/ProfilePage.jsx
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export const ProfilePage = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 transition-transform hover:scale-[1.01] duration-300">

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-extrabold text-white shadow-lg transform transition-transform hover:rotate-6 duration-300">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-5">Welcome, {user?.name}</h1>
            <p className="text-gray-500 text-sm mt-2 max-w-md">
              This is your personal dashboard — manage and view your account details here.
            </p>
          </div>

          {/* Profile Details */}
          <div className="grid gap-6 text-gray-700">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 hover:text-blue-600 transition-colors duration-200">
              <span className="font-semibold">Full Name:</span>
              <span className="text-gray-800">{user?.name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 hover:text-blue-600 transition-colors duration-200">
              <span className="font-semibold">Email Address:</span>
              <span className="text-gray-800 truncate max-w-xs">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center hover:text-blue-600 transition-colors duration-200">
              <span className="font-semibold">Member Since:</span>
              <span className="text-gray-800">
                {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Optional Action Button */}
          <div className="mt-10 flex justify-center">
            <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              Edit Profile
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
