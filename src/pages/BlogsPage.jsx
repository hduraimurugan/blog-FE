import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { throttle } from 'lodash';
import { backendUrl } from '../api/config';
import { BsThreeDotsVertical } from "react-icons/bs";
import DOMPurify from 'dompurify'; // Import DOMPurify for sanitization
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const BlogsPage = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [author, setAuthor] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [blogToDeleteId, setBlogToDeleteId] = useState(null);
  const { showToast } = useToast();

  const categories = ['All', 'Tech', 'Health', 'Travel', 'Finance', 'Lifestyle'];

  const fetchBlogs = async (category, page) => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/blog/get`, {
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

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${backendUrl}/api/blog/delete/${id}`, {
        withCredentials: true,
      });
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== id));
      showToast('Blog deleted successfully', 'success');

    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

 const handleShare = (blog) => {
  const blogUrl = `${window.location.origin}/blog/${blog._id}`; // 👈 Dynamic blog link

  if (navigator.share) {
    // Web Share API (mobile only)
    navigator.share({
      title: blog.title,
      text: `Check out this blog: ${blog.title}`,
      url: blogUrl,
    }).catch((error) => {
      console.log('Error sharing:', error);
    });
  } else {
    // Fallback: Copy to clipboard
    navigator.clipboard.writeText(blogUrl).then(() => {
      alert('Link copied to clipboard!');
      // You could also use a toast notification instead
    }).catch(err => {
      console.error('Failed to copy link:', err);
    });
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
    const handleScroll = throttle(() => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
        !loading &&
        hasMore
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    }, 300); // Adjust delay (ms) as needed

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  return (
    <div className="min-h-screen py-12 px-8 sm:px-6 lg:px-8 ">
      <div className="max-w-7xl mx-auto">

        {/* Category Filter */}
        <div className="w-full mb-10">
          <div
            className="filter flex space-x-2 overflow-x-auto scrollbar-hide px-2"
          >
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
                className={`btn disabled: ${selectedCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => {
                  if (cat !== "All") {
                    setBlogs([]);
                  }
                  setSelectedCategory(cat);
                }}
              />
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center mt-10 space-x-3 animate-pulse">
            <svg
              className="w-6 h-6 text-blue-500 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <p className="text-blue-500 font-medium italic">Fetching more blogs for you...</p>
          </div>
        )}

        {/* Blogs Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              onClick={() => navigate(`/blog/${blog._id}`)}
              className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transform transition duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="h-48 w-full bg-gray-200 relative">
                {/* {blog.image ? (
                  <img
                    src={blog.image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8fA%3D%3D"}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                ) : ( */}
                <div className="absolute inset-0 flex items-center justify-center bg-blue-100">
                  <span className="text-blue-600 font-semibold text-lg">No Image</span>
                </div>
                {/* )} */}
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between space-x-2 mb-2">
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
                    {blog.category || 'Uncategorized'}
                  </span>

                  {/* Three dot menu */}
                  <div className="relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="dropdown dropdown-end">
                      <label tabIndex={0} className="flex items-center cursor-pointer">
                        <div className="w-9 h-9 overflow-hidden rounded-full text-indigo-900  grid place-items-center">
                          <BsThreeDotsVertical />
                        </div>
                      </label>

                      <ul tabIndex={0} className="dropdown-content menu p-3 mt-2 shadow-lg bg-white rounded-xl w-52 z-30 border border-gray-100">

                        {blog.author._id === user._id && (
                          <>
                            <li className="mb-1">
                              <button
                                // onClick={() => handleDelete(blog._id)}
                                onClick={() => {
                                  setBlogToDeleteId(blog._id);
                                  setShowConfirmModal(true);
                                  document.activeElement.blur(); // 👈 Closes the dropdown
                                }}
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg"
                              >
                                <span>Delete</span>
                              </button>
                            </li>
                            <li className="mb-1">
                              <Link to={`/edit/${blog._id}`} className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg"
                                onClick={() => document.activeElement.blur()}>
                                <span>Edit</span>
                              </Link>
                            </li>
                          </>
                        )}

                        <li className="mb-1">
                          <button className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg"
                            onClick={() => {
                              handleShare(blog)
                              document.activeElement.blur()
                            }}>
                            <span>Share</span>
                          </button>
                        </li>

                      </ul>
                    </div>

                  </div>

                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{blog.title}</h2>
                <div
                  className="prose prose-blue max-w-none text-gray-600 text-sm mb-4 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content || '') }}
                />
                {/* <p className="text-gray-600 text-sm mb-4 line-clamp-3">{blog.content}</p> */}
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

        {!hasMore && (
          <div className="text-center mt-12 text-gray-400 text-sm italic">
            You've reached the end of the blogs.
          </div>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6 text-gray-600">Are you sure you want to delete this blog?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete(blogToDeleteId);
                  setShowConfirmModal(false);
                }}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogsPage;
