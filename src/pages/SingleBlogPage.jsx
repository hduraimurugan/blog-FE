"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import DOMPurify from "dompurify"
import { backendUrl } from "../api/config"
import {
  BookmarkIcon,
  HeartIcon,
  ShareIcon,
  CalendarIcon,
  TagIcon,
  ClockIcon,
  MoreVertical,
  Trash,
  Edit,
  Share2,
} from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { generateSignedUrl } from "../utils/aws/aws"

const SingleBlogPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [blog, setBlog] = useState(null)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const { user } = useAuth()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [blogToDeleteId, setBlogToDeleteId] = useState(null)
  const { showToast } = useToast()

  const fetchBlog = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${backendUrl}/api/blog/get/${id}`, {
        withCredentials: true,
      })

      const blogData = response.data.data;

      // Assuming blogData.image contains the key or path in S3
      const signedUrl = await generateSignedUrl(blogData.image);

      // Attach the signed URL to blogData
      const updatedBlog = {
        ...blogData,
        imageUrl: signedUrl,
      };

      setBlog(updatedBlog);
      console.log(response.data.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching blog:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlog()
    window.scrollTo(0, 0)
  }, [id])

  const handleLike = () => {
    setLiked(!liked)
    // Here you would implement the API call to update likes
  }

  const handleSave = () => {
    setSaved(!saved)
    // Here you would implement the API call to save the blog
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog?.title,
        text: `Check out this blog: ${blog?.title}`,
        url: window.location.href,
      })
    } else {
      // Fallback for browsers that don't support share API
      navigator.clipboard.writeText(window.location.href)
      // You could add a toast notification here
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${backendUrl}/api/blog/delete/${id}`, {
        withCredentials: true,
      })
      showToast("Blog deleted successfully", "success")
      navigate("/blogs")
    } catch (error) {
      console.error("Error deleting blog:", error)
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const calculateReadingTime = (content) => {
    const wordsPerMinute = 200
    const text = content.replace(/<[^>]*>/g, "")
    const wordCount = text.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / wordsPerMinute)
    return readingTime
  }

  const navigateToEdit = (blogId, e) => {
    e.stopPropagation()
    window.location.href = `/edit/${blogId}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-lg font-medium text-base-content/70">Loading amazing content...</p>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-3xl font-bold">Blog Not Found</h1>
            <p className="py-6 text-base-content/70">
              The blog you're looking for doesn't exist or may have been removed.
            </p>
            <button className="btn btn-primary" onClick={() => window.history.back()}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  const sanitizedHTML = DOMPurify.sanitize(blog.content || "")
  const readingTime = calculateReadingTime(blog.content || "")

  return (
    <div className="">
      {/* Featured Image Header */}
      {blog.imageUrl ? (
        <div className="w-full h-[40vh] md:h-[50vh] lg:h-[60vh] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-base-100 opacity-40 z-10"></div>
          <img src={blog.imageUrl || "/placeholder.svg"} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      ) : (
      <div className="w-full h-[40vh] md:h-[50vh] lg:h-[60vh] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-blue-100 rounded-2xl w-full h-full">
          <span className="text-primary font-semibold text-lg">No Image Available</span>
        </div>
      </div>
       )}

      {/* Blog Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 -mt-20 relative z-10">
        <div className="bg-base-100 shadow-xl rounded-lg p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
          {/* Category Badge and Reading Time */}
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <div className="badge badge-primary gap-2 py-3 px-4">
              <TagIcon size={16} />
              {blog.category || "Uncategorized"}
            </div>

            <div className="flex items-center gap-2 badge badge-ghost py-3">
              <ClockIcon size={16} />
              <span>{readingTime} min read</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 md:mb-6 leading-tight">{blog.title}</h1>

          {/* Author & Date */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-base-200">
            <div className="flex items-center">
              <div className="avatar">
                <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img
                    src={blog.author.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=" + blog.author.name}
                    alt={blog.author.name}
                  />
                </div>
              </div>
              <div className="ml-3">
                <div className="font-medium">{blog.author.name || "Unknown Author"}</div>
                <div className="text-sm opacity-70">{blog.author.role || "Author"}</div>
              </div>
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-4">
              <div className="flex items-center">
                <CalendarIcon size={16} className="mr-2 text-primary" />
                <span className="text-sm">{formatDate(blog.createdAt)}</span>
              </div>

              {/* Dropdown Menu */}
              <div className="dropdown dropdown-end" onClick={(e) => e.stopPropagation()}>
                <label tabIndex={0} className="btn btn-ghost btn-circle btn-sm hover:bg-base-200">
                  <MoreVertical size={18} />
                </label>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52">
                  {blog.author?._id === user._id && (
                    <>
                      <li>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setBlogToDeleteId(blog._id)
                            setShowConfirmModal(true)
                          }}
                          className="text-error hover:bg-error/10 hover:bg-opacity-10"
                        >
                          <Trash size={16} />
                          Delete
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={(e) => navigateToEdit(blog._id, e)}
                          className="hover:bg-primary/10 hover:bg-opacity-10"
                        >
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
                      className="hover:bg-secondary/10 hover:bg-opacity-10"
                    >
                      <Share2 size={16} />
                      Share
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Table of Contents (Optional - could be added) */}

          {/* Content */}
          <article className="prose prose-lg max-w-none mb-8 md:mb-12 prose-headings:font-bold prose-headings:text-primary prose-a:text-secondary prose-img:rounded-xl prose-img:mx-auto">
            <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
          </article>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mb-6 md:mb-8">
              <h4 className="text-sm font-semibold mb-2 text-base-content/70">Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="badge badge-outline hover:badge-primary transition-colors duration-200 cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 md:mt-8 pt-6 border-t border-base-200">
            <div className="flex flex-wrap gap-2">
              <button
                className={`btn btn-sm md:btn-md btn-outline ${liked ? "btn-error" : ""} gap-2`}
              // onClick={handleLike}
              >
                <HeartIcon size={18} className={liked ? "fill-current" : ""} />
                <span className="hidden sm:inline">{liked ? blog.likes + 1 : blog.likes} Likes</span>
                <span className="inline sm:hidden">{liked ? blog.likes + 1 : blog.likes}</span>
              </button>

              <button
                className={`btn btn-sm md:btn-md btn-outline ${saved ? "btn-primary" : ""} gap-2`}
                onClick={handleSave}
              >
                <BookmarkIcon size={18} className={saved ? "fill-current" : ""} />
                <span className="hidden sm:inline">Save</span>
              </button>

              <button className="btn btn-sm md:btn-md btn-outline gap-2" onClick={handleShare}>
                <ShareIcon size={18} />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>

            {/* Comment Count or CTA */}
            {blog.comments && <div className="badge badge-lg badge-secondary">{blog.comments.length} Comments</div>}
          </div>

          {/* Author Bio (Optional) */}
          {blog.author && (
            <div className="mt-8 md:mt-12 p-4 md:p-6 bg-base-200 rounded-lg transition-all hover:shadow-md">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="avatar">
                  <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img
                      src={blog.author.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=" + blog.author.name}
                      alt={blog.author.name}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-center sm:text-left">About {blog.author.name}</h3>
                  <p className="mt-2 text-base-content/80">{blog.author.email}</p>
                </div>
              </div>
            </div>
          )}

          {showConfirmModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="modal-box max-w-sm w-full">
                <h3 className="font-bold text-lg mb-4">Confirm Deletion</h3>
                <p className="mb-6 text-base-content/70">
                  Are you sure you want to delete this blog? This action cannot be undone.
                </p>
                <div className="modal-action">
                  <button onClick={() => setShowConfirmModal(false)} className="btn btn-ghost">
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(blogToDeleteId)
                      setShowConfirmModal(false)
                    }}
                    className="btn btn-error"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Related Posts Section could be added here */}

          {/* Comments Section could be added here */}
        </div>
      </div>
    </div>
  )
}

export default SingleBlogPage
