// src/pages/LoadingPage.jsx
import { Loader2 } from 'lucide-react'

export const LoadingPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
        <p className="text-lg font-medium text-gray-700">Loading...</p>
      </div>
    </div>
  )
}
