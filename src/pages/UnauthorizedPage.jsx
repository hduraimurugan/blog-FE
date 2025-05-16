// src/pages/UnauthorizedPage.jsx
export const UnauthorizedPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="text-center p-8 rounded shadow bg-base-100 max-w-md">
        <h1 className="text-4xl font-bold text-error mb-4">Access Denied</h1>
        <p className="mb-4">You don't have permission to view this page.</p>
        <a href="/" className="btn btn-primary">
          Go Back Home
        </a>
      </div>
    </div>
  )
}