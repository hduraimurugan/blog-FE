import React, { use, useEffect, useState } from 'react'
import { backendUrl } from '../api/config'
import axios from 'axios'
import DOMPurify from "dompurify"
import { useNavigate } from 'react-router-dom'
import { generateSignedUrl } from '../utils/aws/aws'
import { motion } from "framer-motion";


const HomePage = () => {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchBlogs = async (pageToFetch) => {
        try {
            setLoading(true)
            const response = await axios.get(`${backendUrl}/api/blog/get`, {
                withCredentials: true,
            })

            const newBlogs = response.data.data

            // Generate signed URLs for each blog image
            const blogsWithSignedUrls = await Promise.all(
                newBlogs.map(async (blog) => {
                    const signedUrl = await generateSignedUrl(blog.image); // assuming blog.image holds the S3 key or path
                    return {
                        ...blog,
                        imageUrl: signedUrl, // add signed URL here
                    };
                })
            );

            const uniqueNewBlogs = blogsWithSignedUrls.filter(
                (newBlog) => !blogs.some((existingBlog) => existingBlog._id === newBlog._id),
            )
            if (pageToFetch === 1) {
                setBlogs(blogsWithSignedUrls)
            } else {
                setBlogs((prevBlogs) => [...prevBlogs, ...uniqueNewBlogs])
            }
        } catch (error) {
            console.error("Error fetching blogs:", error)
        } finally {
            setLoading(false)
        }
    }

    const navigateToBlog = (blogId) => {
        window.location.href = `/blog/${blogId}`
    }

    useEffect(() => {
        fetchBlogs()
    }, [])

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Latest Blogs</h1>

            {/* Loading Indicator */}
            {loading && blogs.length === 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 my-12">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="card bg-base-100 shadow-xl animate-pulse overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                            <figure className="h-48 bg-base-200">
                                <div className="w-full h-full bg-blue-200" />
                            </figure>

                            <div className="card-body">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="badge bg-primary/30 w-24 h-5 rounded-full"></div>
                                </div>

                                <h2 className="card-title space-y-2">
                                    <div className="bg-base-300 h-5 w-3/4 rounded-md"></div>
                                    <div className="bg-base-300 h-5 w-2/3 rounded-md"></div>
                                </h2>

                                <div className="space-y-2 mt-2">
                                    <div className="bg-base-300 h-4 w-full rounded-md"></div>
                                    <div className="bg-base-300 h-4 w-11/12 rounded-md"></div>
                                    <div className="bg-base-300 h-4 w-2/3 rounded-md"></div>
                                </div>

                                {/* Author section (hidden in actual cards but still sketched) */}
                                <div className="hidden items-center mt-4 pt-4 border-t border-base-200">
                                    <div className="avatar">
                                        <div className="w-12 h-12 rounded-full bg-base-300"></div>
                                    </div>
                                    <div className="ml-3 space-y-2">
                                        <div className="h-4 w-24 bg-base-300 rounded-md"></div>
                                        <div className="h-3 w-16 bg-base-300 rounded-md opacity-70"></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}


            {!loading && blogs.length === 0 && (
                <div className="text-center my-16">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold mb-2">No blogs found</h3>
                    <p className="text-base-content/70">Try adjusting your search or filter to find what you're looking for</p>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {blogs.map((blog) => (
                    <motion.div
                        key={blog._id}
                        onClick={() => navigateToBlog(blog._id)}
                        className="card bg-base-100 shadow-xl hover:shadow-2xl overflow-hidden cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.1 }}
                        whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.12)" }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <figure className="h-48 bg-base-200">
                            {blog.imageUrl ? (
                                <img src={blog.imageUrl || "/placeholder.svg"} alt={blog.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                    <span className="text-primary font-semibold">No Image</span>
                                </div>
                            )}
                        </figure>

                        <div className="card-body">
                            <div className="flex justify-between items-start">
                                <div className="badge badge-primary">{blog.category || "Uncategorized"}</div>

                            </div>

                            <h2 className="card-title line-clamp-2">{blog.title}</h2>

                            <div
                                className="line-clamp-3 text-base-content/70 text-sm mt-2"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content || "") }}
                            />

                            <div className="hidden flex items-center mt-4 pt-4 border-t border-base-200">
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
                    </motion.div>
                ))}
            </div>

            <div className="flex justify-center mt-8">
                <motion.button
                    className="btn btn-primary btn-outline"
                    onClick={() => navigate("/blogs")}
                    whileHover={{ scale: 1.05, backgroundColor: "#3b82f6", color: "#fff" }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    Load More Blogs
                </motion.button>
            </div>
        </div>
    )
}

export default HomePage;