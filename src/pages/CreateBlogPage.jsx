import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit'; // ✅ Import StarterKit separately
import CodeBlock from '@tiptap/extension-code-block'
import Blockquote from '@tiptap/extension-blockquote'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import { uploadImageToS3, generateSignedUrl } from '../utils/aws/aws';
import { useToast } from '../context/ToastContext';
import { backendUrl } from '../api/config';
import axios from 'axios';
import {
    FaBold,
    FaItalic,
    FaStrikethrough,
    FaHeading,
    FaListUl,
    FaListOl,
    FaCode,
    FaQuoteRight,
    FaUndo,
    FaRedo,
    FaMinus,
    FaRegImage
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const EditorMenuBar = ({ editor }) => {
    if (!editor) return null;

    const buttons = [
        {
            icon: <FaBold />,
            action: () => editor.chain().focus().toggleBold().run(),
            isActive: editor.isActive('bold'),
            label: 'Bold (Ctrl+B)',
        },
        {
            icon: <FaItalic />,
            action: () => editor.chain().focus().toggleItalic().run(),
            isActive: editor.isActive('italic'),
            label: 'Italic (Ctrl+I)',
        },
        {
            icon: <FaStrikethrough />,
            action: () => editor.chain().focus().toggleStrike().run(),
            isActive: editor.isActive('strike'),
            label: 'Strikethrough (Ctrl+Shift+S)',
        },
        {
            icon: <FaHeading />,
            action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            isActive: editor.isActive('heading', { level: 2 }),
            label: 'Heading 2',
        },
        {
            icon: <FaListUl />,
            action: () => editor.chain().focus().toggleBulletList().run(),
            isActive: editor.isActive('bulletList'),
            label: 'Bullet List',
        },
        {
            icon: <FaListOl />,
            action: () => editor.chain().focus().toggleOrderedList().run(),
            isActive: editor.isActive('orderedList'),
            label: 'Numbered List',
        },
        {
            icon: <FaCode />,
            action: () => editor.chain().focus().toggleCode().run(),
            isActive: editor.isActive('code'),
            label: 'Inline Code',
        },
        {
            icon: <FaCode />,
            action: () => editor.chain().focus().toggleCodeBlock().run(),
            isActive: editor.isActive('codeBlock'),
            label: 'Code Block',
        },
        {
            icon: <FaQuoteRight />,
            action: () => editor.chain().focus().toggleBlockquote().run(),
            isActive: editor.isActive('blockquote'),
            label: 'Blockquote',
        },
        {
            icon: <FaMinus />,
            action: () => editor.chain().focus().setHorizontalRule().run(),
            isActive: false,
            label: 'Horizontal Rule',
        },
        {
            icon: <FaUndo />,
            action: () => editor.chain().focus().undo().run(),
            isActive: false,
            label: 'Undo (Ctrl+Z)',
        },
        {
            icon: <FaRedo />,
            action: () => editor.chain().focus().redo().run(),
            isActive: false,
            label: 'Redo (Ctrl+Y)',
        },
    ];

    return (
        <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 border rounded-lg shadow-sm">
            {buttons.map((btn, idx) => (
                <button
                    key={idx}
                    onClick={btn.action}
                    type="button"
                    title={btn.label}
                    className={`flex items-center justify-center w-10 h-10 text-lg rounded-md border transition-all duration-200 
            ${btn.isActive
                            ? 'bg-blue-600 text-white shadow-lg scale-105'
                            : 'bg-white text-gray-600 hover:bg-blue-100 hover:text-blue-700'
                        }`}
                >
                    {btn.icon}
                </button>
            ))}
        </div>
    );
};


const CreateBlogPage = () => {
    const { showToast } = useToast()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const [blogData, setBlogData] = useState({
        title: '',
        category: 'Career',
        content: '',
        image: null,
    });

    const categories = [
        'Career',
        'Finance',
        'Technology',
        'Travel',
        'Lifestyle',
        'Health',
        'Education',
        'Food & Drink',
        'Entertainment',
        'Sports',
        'Science',
        'Business',
        'Fashion',
        'Photography',
        'Art & Design',
        'Politics',
        'Environment',
        'Parenting',
        'DIY & Crafts',
        'Gaming',
        'Music',
        'Books & Literature',
        'Relationships',
        'Mental Health',
        'Productivity',
        'Startups',
        'Marketing',
        'Cryptocurrency',
        'Real Estate',
        'Automotive',
    ];

    const editor = useEditor({
        extensions: [
            StarterKit,
            CodeBlock,
            Blockquote,
            HorizontalRule,
        ],
        content: blogData.content,
        onUpdate: ({ editor }) => {
            setBlogData((prev) => ({
                ...prev,
                content: editor.getHTML(),
            }));
        },
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBlogData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Upload to S3
                const key = await uploadImageToS3(file, 'blog-images'); // 'blog-images' is a folder prefix

                // Generate signed URL for preview
                const signedUrl = await generateSignedUrl(key);
                // console.log("Signed URL:", signedUrl);

                // Update blog data
                setBlogData((prev) => ({
                    ...prev,
                    image: key, // store the key (for saving to DB)
                    imageUrl: signedUrl, // for previewing locally
                }));

                console.log("Image uploaded successfully:", key);
            } catch (error) {
                alert("Image upload failed. Please try again.");
                console.error("S3 Upload Error:", error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {

            const res = await axios.post(`${backendUrl}/api/blog/create`, {
                ...blogData,
            }, { withCredentials: true })

            if (res.status === 201) {
                navigate('/blogs')
                showToast('Blog created successfully!', 'success')
            }
        } catch (err) {
            showToast(err.msg, 'error')
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className="min-h-screen  py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white shadow-xl rounded-2xl p-6 md:p-10 transition-all duration-300">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Write Your Thoughts</h1>

                    <form onSubmit={handleSubmit}>
                        {/* Title Input */}
                        <div className="mb-6">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={blogData.title}
                                onChange={handleChange}
                                placeholder="Your amazing blog title..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Category Dropdown */}
                        <div className="mb-6">
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={blogData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Image Upload */}
                        <div className="hidden mb-6">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Image
                            </label>
                            <input
                                type="text"
                                id="image"
                                name="image"
                                value={blogData.image}
                                onChange={handleChange}
                                placeholder="Your amazing blog title..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className=" mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
                            <div className="mt-1 flex items-center space-x-4">
                                {blogData.imageUrl ? (
                                    <img
                                        src={blogData.imageUrl}
                                        alt="Preview"
                                        className="h-20 w-20 object-cover rounded-md"
                                    />
                                ) : (
                                    <div className="h-20 w-20 flex items-center justify-center bg-gray-100 rounded-md border border-dashed border-gray-300">
                                        <FaRegImage className="text-gray-400" size={24} />
                                    </div>
                                )}
                                <label className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    Upload Image
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="sr-only"
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Rich Text Editor */}
                        <div className="mb-10">
                            <label className="block text-md font-semibold text-gray-800 mb-4">
                                Blog Content
                            </label>

                            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                                {/* Toolbar */}
                                <div className="p-4 border-b border-gray-200 bg-gray-50">
                                    <EditorMenuBar editor={editor} />
                                </div>

                                {/* Editor */}
                                <div className="p-6">
                                    <EditorContent
                                        editor={editor}
                                        className="min-h-[250px] text-base focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>


                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className={`px-6 py-3 font-semibold rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                                    }`}
                                disabled={loading}
                            >
                                {loading ? 'Publishing...' : 'Publish Blog'}
                            </button>

                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateBlogPage;