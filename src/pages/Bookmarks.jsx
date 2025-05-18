import React from 'react'
import { FaBookmark } from 'react-icons/fa'

const Bookmarks = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
      <div className="text-primary mb-6">
        <FaBookmark className="text-6xl md:text-7xl" />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Bookmarks Coming Soon</h1>
      <p className="text-base-content/70 max-w-md">
        We're working hard to bring your favorite saved content here. Stay tuned!
      </p>
    </div>
  )
}

export default Bookmarks
