import { useEffect, useState } from "react"
import axios from "axios"
import { throttle } from "lodash"
import DOMPurify from "dompurify"
import { Search, MoreVertical, Edit, Trash, Share2, Loader2 } from "lucide-react"
import { backendUrl } from '../api/config'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function BlogsPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [blogs, setBlogs] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [blogToDeleteId, setBlogToDeleteId] = useState(null)

  const categories = ["All", "Technology", "Health", "Travel", "Finance", "Lifestyle"]

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchBlogs = async (category, pageToFetch, search) => {
    try {
      setLoading(true)
      const response = await axios.get(`${backendUrl}/api/blog/get`, {
        params: {
          category: category !== "All" ? category : undefined,
          page: pageToFetch,
          limit: 6,
          search: search || undefined,
        },
        withCredentials: true,
      })

      const newBlogs = response.data.data
      const uniqueNewBlogs = newBlogs.filter(
        (newBlog) => !blogs.some((existingBlog) => existingBlog._id === newBlog._id),
      )

      if (newBlogs.length === 0 || uniqueNewBlogs.length === 0) {
        setHasMore(false)
      }

      if (pageToFetch === 1) {
        setBlogs(newBlogs)
      } else {
        setBlogs((prevBlogs) => [...prevBlogs, ...uniqueNewBlogs])
      }
    } catch (error) {
      console.error("Error fetching blogs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${backendUrl}/api/blog/delete/${id}`, {
        withCredentials: true,
      })
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== id))
      showToast("Blog deleted successfully", "success")
    } catch (error) {
      console.error("Error deleting blog:", error)
      showToast("Failed to delete blog", "error")
    }
  }

  const handleShare = (blog) => {
    const blogUrl = `${window.location.origin}/blog/${blog._id}`

    if (navigator.share) {
      navigator
        .share({
          title: blog.title,
          text: `Check out this blog: ${blog.title}`,
          url: blogUrl,
        })
        .catch((error) => {
          console.log("Error sharing:", error)
        })
    } else {
      navigator.clipboard
        .writeText(blogUrl)
        .then(() => {
          showToast("Link copied to clipboard!", "success")
        })
        .catch((err) => {
          console.error("Failed to copy link:", err)
          showToast("Failed to copy link", "error")
        })
    }
  }

  const navigateToBlog = (blogId) => {
    window.location.href = `/blog/${blogId}`
  }

  const navigateToEdit = (blogId, e) => {
    e.stopPropagation()
    window.location.href = `/edit/${blogId}`
  }

  useEffect(() => {
    setBlogs([])
    setPage(1)
    setHasMore(true)
    fetchBlogs(selectedCategory, 1, debouncedSearchQuery)
  }, [debouncedSearchQuery, selectedCategory])

  useEffect(() => {
    if (page > 1) {
      fetchBlogs(selectedCategory, page, debouncedSearchQuery)
    }
  }, [page])

  useEffect(() => {
    const handleScroll = throttle(() => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !loading && hasMore) {
        setPage((prevPage) => prevPage + 1)
      }
    }, 300)

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [loading, hasMore])

  return (
    <div className="min-h-screen py-8 px-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-center mb-8">Explore Blogs</h1>

          {/* Search Bar */}
          <div className="form-control max-w-md mx-auto mb-8">
            <div className="relative input-group">
              <input
                type="text"
                placeholder="Search articles..."
                className="input input-bordered w-full focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-sm btn-square btn-primary absolute right-1 top-1 bottom-0 z-20">
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                className={`btn ${selectedCategory === category ? "btn-primary" : "btn-outline"}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && blogs.length === 0 && (
          <div className="flex justify-center items-center my-12">
            <div className="loading loading-spinner loading-lg text-primary"></div>
          </div>
        )}

        {/* No Results */}
        {!loading && blogs.length === 0 && (
          <div className="text-center my-16">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No blogs found</h3>
            <p className="text-base-content/70">Try adjusting your search or filter to find what you're looking for</p>
          </div>
        )}

        {/* Blogs Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              onClick={() => navigateToBlog(blog._id)}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <figure className="h-48 bg-base-200">
                {/* {blog.image ? (
                  <img src={blog.image || "/placeholder.svg"} alt={blog.title} className="w-full h-full object-cover" />
                ) : ( */}
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <span className="text-primary font-semibold">No Image</span>
                </div>
                {/* )} */}
              </figure>

              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div className="badge badge-primary">{blog.category || "Uncategorized"}</div>

                  {/* Dropdown Menu */}
                  <div className="dropdown dropdown-end" onClick={(e) => e.stopPropagation()}>
                    <label tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
                      <MoreVertical size={18} />
                    </label>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                      {blog.author?._id === user._id && (
                        <>
                          <li>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setBlogToDeleteId(blog._id)
                                setShowConfirmModal(true)
                              }}
                              className="text-error"
                            >
                              <Trash size={16} />
                              Delete
                            </button>
                          </li>
                          <li>
                            <button onClick={(e) => navigateToEdit(blog._id, e)}>
                              <Edit size={16} />
                              Edit
                            </button>
                          </li>
                        </>
                      )}
                      <li>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleShare(blog)
                          }}
                        >
                          <Share2 size={16} />
                          Share
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                <h2 className="card-title line-clamp-2">{blog.title}</h2>

                <div
                  className="line-clamp-3 text-base-content/70 text-sm mt-2"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content || "") }}
                />

                <div className="flex items-center mt-4 pt-4 border-t border-base-200">
                  <div className="flex items-center">
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full">
                        <img
                          src={blog.author.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=" + blog.author.name}
                          alt={blog.author.name}
                        />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="font-medium">{blog.author.name || 'Unknown Author'}</div>
                      <div className="text-sm opacity-70">{blog.author.role || 'Author'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Indicator */}
        {loading && blogs.length > 0 && (
          <div className="flex justify-center mt-8">
            <button className="btn btn-ghost gap-2">
              <Loader2 size={20} className="animate-spin" />
              Loading more...
            </button>
          </div>
        )}

        {/* End of Results */}
        {!hasMore && blogs.length > 0 && (
          <div className="text-center mt-12 text-base-content/50 text-sm italic">
            You've reached the end of the blogs
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Deletion</h3>
            <p className="py-4">Are you sure you want to delete this blog? This action cannot be undone.</p>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={() => {
                  handleDelete(blogToDeleteId)
                  setShowConfirmModal(false)
                }}
              >
                Delete
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowConfirmModal(false)}></div>
        </div>
      )}
    </div>
  )
}
