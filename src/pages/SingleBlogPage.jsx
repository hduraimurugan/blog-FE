import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { backendUrl } from '../api/config';
import {
    BookmarkIcon,
    HeartIcon,
    ShareIcon,
    CalendarIcon,
    UserIcon,
    TagIcon,
    ClockIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BsThreeDotsVertical } from 'react-icons/bs';

const SingleBlogPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [blog, setBlog] = useState(null);
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const { user } = useAuth();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [blogToDeleteId, setBlogToDeleteId] = useState(null);
    const { showToast } = useToast();

    const fetchBlog = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${backendUrl}/api/blog/get/${id}`, {
                withCredentials: true,
            });

            setBlog(response.data.data);
            console.log(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching blog:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlog();
        window.scrollTo(0, 0);
    }, [id]);

    const handleLike = () => {
        setLiked(!liked);
        // Here you would implement the API call to update likes
    };

    const handleSave = () => {
        setSaved(!saved);
        // Here you would implement the API call to save the blog
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: blog?.title,
                text: `Check out this blog: ${blog?.title}`,
                url: window.location.href,
            });
        } else {
            // Fallback for browsers that don't support share API
            navigator.clipboard.writeText(window.location.href);
            // You could add a toast notification here
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${backendUrl}/api/blog/delete/${id}`, {
                withCredentials: true,
            });
            showToast('Blog deleted successfully', 'success');
            navigate('/blogs');
        } catch (error) {
            console.error('Error deleting blog:', error);
        }
    };

    // Format date for better display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Calculate reading time (rough estimate)
    const calculateReadingTime = (content) => {
        const wordsPerMinute = 200;
        const text = content.replace(/<[^>]*>/g, '');
        const wordCount = text.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / wordsPerMinute);
        return readingTime;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="mt-4 text-lg font-medium">Loading amazing content...</p>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="hero min-h-screen bg-base-200">
                <div className="hero-content text-center">
                    <div className="max-w-md">
                        <h1 className="text-3xl font-bold">Blog Not Found</h1>
                        <p className="py-6">The blog you're looking for doesn't exist or may have been removed.</p>
                        <button className="btn btn-primary" onClick={() => window.history.back()}>
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const sanitizedHTML = DOMPurify.sanitize(blog.content || '');
    const readingTime = calculateReadingTime(blog.content || '');

    return (
        <div className="">
            {/* Featured Image Header */}
            {blog.image && (
                <div className="w-full h-96 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-base-100 opacity-60 z-10"></div>
                    <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-100 w-full h-full">
                        <span className="text-blue-600 font-semibold text-lg">No Image</span>
                    </div>
                </div>
            )}

            {/* Blog Content */}
            <div className="md:max-w-4xl md:mx-auto md:px-4 lg:px-8 pb-16 -mt-20 relative z-10">
                <div className="bg-base-100 shadow-xl rounded-lg p-8">
                    {/* Category Badge */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="badge badge-primary gap-2 py-3">
                            <TagIcon size={16} />
                            {blog.category || 'Uncategorized'}
                        </div>

                        <div className="flex items-center gap-2">
                            <ClockIcon size={16} />
                            <span className="text-sm">{readingTime} min read</span>
                        </div>

                    </div>

                    {/* Title */}
                    <h1 className="text-4xl font-extrabold mb-6 leading-tight">{blog.title}</h1>

                    {/* Author & Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 pb-8 border-b border-base-200">
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

                        <div className="flex items-center sm:ml-auto">
                            <CalendarIcon size={16} className="mr-2" />
                            <span>{formatDate(blog.createdAt)}</span>
                        </div>

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
                                                handleShare()
                                                document.activeElement.blur()
                                            }}>
                                            <span>Share</span>
                                        </button>
                                    </li>

                                </ul>
                            </div>

                        </div>
                    </div>

                    {/* Table of Contents (Optional - could be added) */}

                    {/* Content */}
                    <article className="prose prose-lg max-w-none mb-12 prose-headings:font-bold prose-headings:text-primary prose-a:text-secondary prose-img:rounded-xl">
                        <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
                    </article>

                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                        <div className="mb-8">
                            <div className="flex flex-wrap gap-2">
                                {blog.tags.map((tag, index) => (
                                    <span key={index} className="badge badge-outline">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-base-200">
                        <div className="flex gap-2">
                            <button
                                className={`btn btn-outline ${liked ? 'btn-error' : ''}`}
                                onClick={handleLike}
                            >
                                <HeartIcon size={20} className={liked ? 'fill-current' : ''} />
                                <span>{liked ? blog.likes + 1 : blog.likes} Likes</span>
                            </button>

                            <button
                                className={`btn btn-outline ${saved ? 'btn-primary' : ''}`}
                                onClick={handleSave}
                            >
                                <BookmarkIcon size={20} className={saved ? 'fill-current' : ''} />
                                <span>Save</span>
                            </button>

                            <button
                                className="btn btn-outline"
                                onClick={handleShare}
                            >
                                <ShareIcon size={20} />
                                <span>Share</span>
                            </button>
                        </div>

                        {/* Comment Count or CTA */}
                        {blog.comments && (
                            <div className="badge badge-lg">
                                {blog.comments.length} Comments
                            </div>
                        )}
                    </div>

                    {/* Author Bio (Optional) */}
                    {blog.author.bio && (
                        <div className="mt-12 p-6 bg-base-200 rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="avatar">
                                    <div className="w-16 h-16 rounded-full">
                                        <img
                                            src={blog.author.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=" + blog.author.name}
                                            alt={blog.author.name}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">About {blog.author.name}</h3>
                                    <p className="mt-2">{blog.author.bio}</p>
                                </div>
                            </div>
                        </div>
                    )}

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

                    {/* Related Posts Section could be added here */}

                    {/* Comments Section could be added here */}
                </div>
            </div>
        </div>
    );
};

export default SingleBlogPage;