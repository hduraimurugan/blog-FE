import React from 'react'
import { IoNotificationsOutline } from 'react-icons/io5'

const Notifications = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
      <div className="text-primary mb-6">
        <IoNotificationsOutline className="text-6xl md:text-7xl" />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Notifications Coming Soon</h1>
      <p className="text-base-content/70 max-w-md">
        We’re building a smarter way to keep you updated. Hang tight — it's on the way!
      </p>
    </div>
  )
}

export default Notifications
