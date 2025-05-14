import { Menu, User, ChevronDown, X, Home, Info, Settings, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [rightMenuOpen, setRightMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const rightMenuRef = useRef<HTMLDivElement>(null);
  const isAuthenticated = useAuthStore((state) => !!state.token); // Check if user is logged in

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (rightMenuRef.current && !rightMenuRef.current.contains(event.target as Node)) {
        setRightMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const toggleRightMenu = () => {
    setRightMenuOpen(!rightMenuOpen);
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev);
    toggleSidebar();
  };

  return (
    <header className="bg-blue-400 shadow sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Left Side: Hamburger Menu and Logo */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="p-2 text-white hover:text-black transition-colors duration-300 ease-in-out"
              onClick={handleSidebarToggle}
            >
              <span className="sr-only">{isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <Link to="/" className="flex items-center space-x-2 transition-transform duration-300 ease-in-out hover:scale-105">
              <img
                src="/logo.avif"
                alt="Medical Dashboard Logo"
                className="h-10 w-10 object-contain rounded-full"
              />
              <span className="text-xl font-bold text-gray-900">MediNex</span>
            </Link>
          </div>

          {/* Navigation Links - Visible on larger screens */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-white hover:text-black text-sm font-medium transition-colors duration-300 ease-in-out"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-white hover:text-black text-sm font-medium transition-colors duration-300 ease-in-out"
            >
              About Us
            </Link>
            <Link
              to="/services"
              className="text-white hover:text-black text-sm font-medium transition-colors duration-300 ease-in-out"
            >
              Services
            </Link>
            <Link
              to="/contact"
              className="text-white hover:text-black text-sm font-medium transition-colors duration-300 ease-in-out"
            >
              Contact
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-2">
            {/* Right Hamburger Menu - Only visible on mobile */}
            <div className="relative md:hidden" ref={rightMenuRef}>
              <button
                type="button"
                className="p-2 text-white hover:text-black transition-colors duration-300 ease-in-out"
                onClick={toggleRightMenu}
              >
                <span className="sr-only">{rightMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}</span>
                <div className="relative h-6 w-6">
                  <Menu
                    className={`h-6 w-6 absolute transition-transform duration-300 ease-in-out ${
                      rightMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
                    }`}
                    aria-hidden="true"
                  />
                  <X
                    className={`h-6 w-6 absolute transition-transform duration-300 ease-in-out ${
                      rightMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
                    }`}
                    aria-hidden="true"
                  />
                </div>
              </button>

              {/* Right side dropdown with nav links and auth options */}
              {rightMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setRightMenuOpen(false)}
                  >
                    <Home className="mr-2 h-5 w-5" /> Home
                  </Link>
                  <Link
                    to="/about"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setRightMenuOpen(false)}
                  >
                    <Info className="mr-2 h-5 w-5" /> About Us
                  </Link>
                  <Link
                    to="/services"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setRightMenuOpen(false)}
                  >
                    <Settings className="mr-2 h-5 w-5" /> Services
                  </Link>
                  <Link
                    to="/contact"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setRightMenuOpen(false)}
                  >
                    <Phone className="mr-2 h-5 w-5" /> Contact
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  {!isAuthenticated ? (
                    <>
                      <Link
                        to="/login"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setRightMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setRightMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  ) : (
                    <Link
                      to="/logout"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setRightMenuOpen(false)}
                    >
                      Logout
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* User menu dropdown - Always visible */}
            <div className="relative" ref={userMenuRef}>
              <button
                className="flex items-center space-x-1 rounded-full bg-white p-2 text-black hover:text-gray-500 hover:bg-gray-100 transition-colors duration-300 ease-in-out"
                onClick={toggleUserMenu}
              >
                <User className="h-6 w-6" aria-hidden="true" />
                <ChevronDown className="h-4 w-4 hidden md:block" />
              </button>

              {/* Dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  {!isAuthenticated ? (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  ) : (
                    <Link
                      to="/logout"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Logout
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}