import React, { useEffect, useState } from 'react';

// Mock data
const mockBlogs = [
  {
    id: '1',
    title: 'How to Build a Career in Tech',
    category: 'Career',
    author: 'Jane Doe',
    content: 'A detailed guide on how to start and grow your career in the tech industry.',
    image: 'https://source.unsplash.com/featured/?tech ,career&1',
    userId: 'user123',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    title: 'Smart Money Management Tips',
    category: 'Finance',
    author: 'John Smith',
    content: 'Tips for managing your finances effectively and building wealth over time.',
    image: null,
    userId: 'user456',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    title: 'Top 10 Travel Destinations in 2025',
    category: 'Travel',
    author: 'Emily Johnson',
    content: 'Explore the most exciting places to visit next year.',
    image: 'https://source.unsplash.com/featured/?travel ,destination&1',
    userId: 'user789',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const BlogsPage = () => {
  const [blogs, setBlogs] = useState([...mockBlogs]);
  const [loading, setLoading] = useState(false);

  // Simulate infinite scroll
  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !loading) {
      setLoading(true);
      setTimeout(() => {
        setBlogs(prev => [...prev, ...mockBlogs]); // Load more blogs
        setLoading(false);
      }, 1000);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map(blog => (
            <div
              key={blog.id}
              onClick={() => {
                // Navigate to /blog/:id
                console.log(`Navigate to /blog/${blog.id}`);
              }}
              className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transform transition duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="h-48 w-full bg-gray-200 relative">
                {blog.image ? (
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-100">
                    <span className="text-blue-600 font-semibold text-lg">No Image</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full mb-3">
                  {blog.category}
                </span>
                <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{blog.title}</h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{blog.content}</p>
                <div className="flex items-center space-x-3 mt-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white bg-gray-500">
                    {blog.author.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{blog.author}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="text-center mt-8">
            <p className="text-gray-500 italic">Loading more blogs...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogsPage;