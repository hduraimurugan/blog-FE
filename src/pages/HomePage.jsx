import React, { use, useEffect, useState } from 'react'
import { backendUrl } from '../api/config'
import axios from 'axios'
import DOMPurify from "dompurify"
import { useNavigate } from 'react-router-dom'
import { generateSignedUrl } from '../utils/aws/aws'


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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {blogs.map((blog) => (
                    <div
                        key={blog._id}
                        onClick={() => navigateToBlog(blog._id)}
                        className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
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
                    </div>
                ))}
            </div>


            <div className="flex justify-center mt-8">
                <button
                    className="btn btn-primary btn-outline"
                    onClick={() => navigate("/blogs")}>
                    Load More Blogs
                </button>
            </div>
        </div>
    )
}

export default HomePage;