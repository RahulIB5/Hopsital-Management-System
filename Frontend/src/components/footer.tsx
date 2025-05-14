import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-blue-400 text-white py-8 shadow-lg">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">MediNex</h3>
            <p className="text-white text-sm">
              Providing seamless healthcare management solutions for patients, doctors, and administrators.
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-white hover:text-black text-sm transition-colors duration-300 ease-in-out"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-white hover:text-black text-sm transition-colors duration-300 ease-in-out"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-white hover:text-black text-sm transition-colors duration-300 ease-in-out"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-black transition-colors duration-300 ease-in-out transform hover:scale-105"
              >
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-black transition-colors duration-300 ease-in-out transform hover:scale-105"
              >
                <Twitter className="h-6 w-6" />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-black transition-colors duration-300 ease-in-out transform hover:scale-105"
              >
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="mailto:support@medicaldashboard.com"
                className="text-white hover:text-black transition-colors duration-300 ease-in-out transform hover:scale-105"
              >
                <Mail className="h-6 w-6" />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-black pt-4 text-center">
          <p className="text-white text-sm">
            © {new Date().getFullYear()} MediNex. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}