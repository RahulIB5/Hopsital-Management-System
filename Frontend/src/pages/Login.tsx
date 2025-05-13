import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/axios';
import toast, { Toaster } from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      console.log('Login payload:', formData.toString());

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { token, user } = response.data;
      setAuth(token, user);
      toast.success('Login successful');
      navigate(from, { replace: true });
    } catch (error: any) {
      let errorMessage = 'Invalid email or password';
      if (error.response) {
        if (Array.isArray(error.response.data?.detail)) {
          errorMessage = error.response.data.detail.map((err: any) => err.msg).join(', ');
        } else {
          errorMessage = error.response.data?.detail || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'Network error: Unable to reach the server. Check CORS settings or server status.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      toast.error(errorMessage);
      console.error('Login error:', {
        message: error.message,
        response: error.response?.data,
        request: error.request,
        config: error.config,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        email,
        password,
        role,
      };

      console.log('Signup payload:', payload);

      const response = await api.post('/auth/register', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      toast.success('Registration successful! Please log in.');
      setIsSignupMode(false);
      setEmail('');
      setPassword('');
      setRole('user');
    } catch (error: any) {
      let errorMessage = 'Registration failed';
      if (error.response) {
        if (Array.isArray(error.response.data?.detail)) {
          errorMessage = error.response.data.detail.map((err: any) => err.msg).join(', ');
        } else {
          errorMessage = error.response.data?.detail || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'Network error: Unable to reach the server. Check CORS settings or server status.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      toast.error(errorMessage);
      console.error('Signup error:', {
        message: error.message,
        response: error.response?.data,
        request: error.request,
        config: error.config,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-100 via-white to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg transform transition-all duration-500 ease-in-out opacity-0 translate-y-4" style={{ animation: 'fadeInUp 0.5s forwards' }}>
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 transform transition-transform duration-300 ease-in-out hover:scale-110">
            {isSignupMode ? (
              <UserPlus className="h-6 w-6 text-blue-600" />
            ) : (
              <LogIn className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignupMode ? 'Create a new account' : 'Sign in to your account'}
          </h2>
          {!isSignupMode && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Default admin credentials:
              <br />
              Email: admin@example.com
              <br />
              Password: admin123
            </p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={isSignupMode ? handleSignup : handleLogin}>
          <div className="rounded-lg shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-300 ease-in-out"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignupMode ? 'new-password' : 'current-password'}
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                  isSignupMode ? 'rounded-b-lg' : ''
                } focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-300 ease-in-out`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {isSignupMode && (
              <div>
                <label htmlFor="role" className="sr-only">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-300 ease-in-out"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              {isLoading
                ? isSignupMode
                  ? 'Signing up...'
                  : 'Signing in...'
                : isSignupMode
                ? 'Sign up'
                : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignupMode(!isSignupMode)}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-300 ease-in-out"
              disabled={isLoading}
            >
              {isSignupMode ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>

      {/* Custom CSS for Animations */}
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}