import { BellIcon, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  return (
    <header className="bg-blue-400 shadow sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Left Side: Hamburger Menu and Logo */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-white hover:text-black transition-colors duration-300 ease-in-out"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Open sidebar</span>
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

          {/* Navigation Links */}
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

          {/* Right Side: Notification and Login */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="rounded-full bg-white p-2 text-black hover:text-gray-500 hover:bg-gray-100 transition-colors duration-300 ease-in-out"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            <Link
              to="/login"
              className="text-white hover:text-black text-sm font-medium transition-colors duration-300 ease-in-out"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}