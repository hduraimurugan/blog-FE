import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Menu, X, User, LogOut, PenSquare, Home, Bookmark, Bell } from 'lucide-react';
import axios from 'axios';
import { backendUrl } from '../api/config';

export const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)
  const [pageTitle, setPageTitle] = useState('Blog');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setPageTitle('Explore The Latest Insights');
    else if (path.includes('/create-post')) setPageTitle('Create Blog');
    else if (path.includes('/edit')) setPageTitle('Edit Blog');
    else if (path.includes('/blogs')) setPageTitle('All Blogs');
    else if (path.includes('/profile')) setPageTitle('My Profile');
    else setPageTitle('');
  }, [location.pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])


  const fetchBlogs = async (search) => {
    try {
      setLoading(true)
      const response = await axios.get(`${backendUrl}/api/blog/get`, {
        params: {
          search: search || undefined,
        },
        withCredentials: true,
      })
      const newBlogs = response.data.data
      setBlogs(newBlogs)
    } catch (error) {
      console.error("Error fetching blogs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs(debouncedSearchQuery)
  }, [debouncedSearchQuery])


  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching blog for:', searchQuery);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleSearchBar = () => {
    setShowSearch(!showSearch);
  };

  const isBlogRoute = location.pathname.startsWith('/blog/');

  return (
    <div className="min-h-screen  flex flex-col font-poppins bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  Insight<span className="font-light">Hub</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link
                to="/"
                className={`text-sm font-medium hover:text-blue-600 transition-colors ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-700'
                  }`}
              >
                Home
              </Link>
              <Link
                to="/blogs"
                className={`text-sm font-medium hover:text-blue-600 transition-colors ${location.pathname.includes('/blogs') ? 'text-blue-600' : 'text-gray-700'
                  }`}
              >
                Blogs
              </Link>
              {user && (
                <Link
                  to="/create-post"
                  className={`text-sm font-medium hover:text-blue-600 transition-colors ${location.pathname.includes('/create-post') ? 'text-blue-600' : 'text-gray-700'
                    }`}
                >
                  Write
                </Link>
              )}
            </div>

            {/* Search Bar (Desktop) */}
            <div className="hidden lg:flex flex-1 max-w-md mx-6">
              <div className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search articles..."
                    className="w-full bg-gray-100 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
                  >
                    <Search size={16} />
                  </button>

                  {searchQuery.trim() !== "" && (
                    <div className="absolute z-50 mt-2 w-full bg-white rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {loading ? (
                        <div className="p-2 text-sm text-gray-500">Loading...</div>
                      ) : blogs.length > 0 ? (
                        blogs.map((blog) => (
                          <div
                            key={blog._id}
                            onClick={() => navigate(`/blog/${blog._id}`)}
                            className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                          >
                            {blog.title}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500">No Blogs Found</div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Right Navigation Items */}
            <div className="flex items-center">
              {/* Mobile Search Toggle */}
              <button
                className="lg:hidden p-2 mr-2 text-gray-600 hover:text-blue-600 focus:outline-none"
                onClick={toggleSearchBar}
              >
                <Search size={20} />
              </button>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="flex items-center cursor-pointer">
                      <div className="w-9 h-9 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white grid place-items-center">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-medium text-sm">{user.name?.[0] || 'U'}</span>
                        )}
                      </div>
                    </label>
                    <ul tabIndex={0} className="dropdown-content menu p-3 mt-2 shadow-lg bg-white rounded-xl w-52 z-30 border border-gray-100">
                      <li className="mb-1">
                        <Link to="/profile" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg">
                          <User size={16} className="mr-2" />
                          <span>My Profile</span>
                        </Link>
                      </li>
                      <li className="mb-1">
                        <Link to="/bookmarks" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg">
                          <Bookmark size={16} className="mr-2" />
                          <span>Bookmarks</span>
                        </Link>
                      </li>
                      <li className="mb-1">
                        <Link to="/notifications" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg">
                          <Bell size={16} className="mr-2" />
                          <span>Notifications</span>
                        </Link>
                      </li>
                      <li className="border-t my-1 pt-1">
                        <button
                          onClick={logout}
                          className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <LogOut size={16} className="mr-2" />
                          <span>Logout</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex space-x-2">
                  <Link to="/login?tab=login" className="px-4 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 transition-colors">
                    Login
                  </Link>
                  <Link to="/login?tab=signup" className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden ml-3 p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                onClick={toggleMobileMenu}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {showSearch && (
            <div className="lg:hidden py-2 px-2">
              <div className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search articles..."
                    className="w-full bg-gray-100 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
                  >
                    <Search size={16} />
                  </button>

                  {searchQuery.trim() !== "" && (
                    <div className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {loading ? (
                        <div className="p-2 text-sm text-gray-500">Loading...</div>
                      ) : blogs.length > 0 ? (
                        blogs.map((blog) => (
                          <div
                            key={blog._id}
                            onClick={() => navigate(`/blog/${blog._id}`)}
                            className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                          >
                            {blog.title}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500">No Blogs Found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white pb-3 px-4 border-t border-gray-100">
              <div className="space-y-1 pt-2">
                <Link
                  to="/"
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-100 hover:text-blue-600 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home size={18} className="mr-3" />
                  Home
                </Link>
                <Link
                  to="/blogs"
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-100 hover:text-blue-600 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Bookmark size={18} className="mr-3" />
                  Blogs
                </Link>
                {user && (
                  <Link
                    to="/create-post"
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-100 hover:text-blue-600 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <PenSquare size={18} className="mr-3" />
                    Write a Post
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section: Only on Home Page */}
      <div className=''>
        {location.pathname === '/' ? (
          <section className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-16">
            <div className="container mx-auto px-4 md:px-6 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {pageTitle}
              </h1>
              <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                Discover thought-provoking articles, expert opinions, and the latest trends.
              </p>

              {!user && (
                <div className="flex justify-center flex-wrap gap-4">
                  <Link
                    to="/login"
                    className="px-6 py-3 bg-white text-blue-700 font-medium rounded-full hover:bg-blue-50 transition-colors"
                  >
                    Join Our Community
                  </Link>
                  <Link
                    // to="/learn-more"
                    className="px-6 py-3 border border-white text-white font-medium rounded-full hover:bg-white hover:bg-opacity-10 hover:text-primary transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              )}
            </div>
          </section>
        ) : (location.pathname === '/login' || isBlogRoute) ? (
          <section className="">
          </section>
        ) : (
          // Non-Home Page Title Section
          <section className="">
            {/* <div className="container mx-auto px-4 md:px-6 py-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{pageTitle}</h1>

            </div> */}
          </section>
        )}
      </div>


      {/* Main Content */}
      <main className="flex-grow container mx-auto md:px-6 py-8">
        <Outlet />
      </main>

      {/* Newsletter */}
      {user && (
        <section className="bg-gray-50 border-t border-gray-200 py-12">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-xl mx-auto text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Stay updated with our newsletter
              </h3>
              <p className="text-gray-600 mb-6">
                Get the latest articles, resources, and insights delivered to your inbox.
              </p>
              <form className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>)}

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="text-xl font-bold text-white mb-4 block">
                Insight<span className="font-light">Hub</span>
              </Link>
              <p className="text-gray-400 text-sm mt-2">
                A platform for sharing knowledge, insights, and innovative ideas.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Navigation
              </h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-300 hover:text-white text-sm">Home</Link></li>
                <li><Link to="/blogs" className="text-gray-300 hover:text-white text-sm">Blogs</Link></li>
                <li><Link to="https://durai-portfolio.vercel.app/#about" target='_blank' className="text-gray-300 hover:text-white text-sm">About Us</Link></li>
                <li><Link to="https://durai-portfolio.vercel.app/#contact" target='_blank' className="text-gray-300 hover:text-white text-sm">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Legal
              </h3>
              <ul className="space-y-2">
                <li><Link to="/privacy-policy" className="text-gray-300 hover:text-white text-sm">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-300 hover:text-white text-sm">Terms of Service</Link></li>
                <li><Link to="/cookie-policy" className="text-gray-300 hover:text-white text-sm">Cookie Policy</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Connect
              </h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-blue-400">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-pink-600">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-500">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-700 text-sm text-gray-400 text-center">
            <p>© 2025 InsightHub | Created by Duraimurugan H | All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};