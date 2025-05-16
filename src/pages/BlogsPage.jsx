import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [author, setAuthor] = useState('');

  const navigate = useNavigate();

  const categories = ['All', 'Tech', 'Health', 'Travel', 'Finance', 'Lifestyle'];

  const fetchBlogs = async (category, page) => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/blog/get`, {
        params: {
          category: category !== 'All' ? category : undefined,
          page,
          limit: 6,
          author: author ? author : undefined,
        },
        withCredentials: true,
      });

      const newBlogs = response.data.data;
      const uniqueNewBlogs = newBlogs.filter(
        (newBlog) => !blogs.some((existingBlog) => existingBlog._id === newBlog._id)
      );

      if (newBlogs.length === 0 || uniqueNewBlogs.length === 0) {
        setHasMore(false);
      }

      setBlogs((prevBlogs) => [...prevBlogs, ...uniqueNewBlogs]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    setBlogs([]);
    setPage(1);
    setHasMore(true);
  }, [selectedCategory]);

  useEffect(() => {
    fetchBlogs(selectedCategory, page);
  }, [page, selectedCategory]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
        !loading &&
        hasMore
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-7xl mx-auto">

        {/* Category Filter */}
        <div className="flex justify-center mb-10">
          <div className="filter space-x-2">
            <input className="btn filter-reset" type="radio" name="category" aria-label="All"
              onClick={() => {
                setSelectedCategory('All');
              }} />
            {categories.map((cat) => (
              <input
                key={cat}
                type="radio"
                name="category"
                aria-label={cat}
                className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => {
                  setBlogs([]);
                  setSelectedCategory(cat);
                }}
              />
            ))}
          </div>
        </div>

        {/* Blogs Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              onClick={() => navigate(`/blog/${blog._id}`)}
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
                  {blog.category || 'Uncategorized'}
                </span>
                <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{blog.title}</h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{blog.content}</p>
                <div className="flex items-center space-x-3 mt-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white bg-gray-500">
                    {blog.author?.name?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{blog.author?.name}</span>
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

        {!hasMore && (
          <div className="text-center mt-12 text-gray-400 text-sm italic">
            You've reached the end of the blogs.
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogsPage;
