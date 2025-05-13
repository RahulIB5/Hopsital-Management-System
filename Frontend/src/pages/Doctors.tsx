import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import api from '../lib/axios';
import toast, { Toaster, toast as toastFunc } from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
}

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
  });
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    } else {
      const fetchDoctors = async () => {
        try {
          const response = await api.get('/doctors');
          setDoctors(response.data);
        } catch (error: any) {
          console.error('Error fetching doctors:', error);
          toast.error(error.response?.data?.detail || 'Failed to fetch doctors');
        } finally {
          setLoading(false);
        }
      };
      fetchDoctors();
    }
  }, [navigate, isAuthenticated]);

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/doctors', formData);
      setDoctors([...doctors, response.data]);
      setFormData({ name: '', specialty: '' });
      setShowForm(false);
      toast.success('Doctor added successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add doctor');
    }
  };

  const confirmDelete = (doctorId: number) => {
    console.log('Delete button clicked for doctor ID:', doctorId);
    toastFunc((t) => (
      <div className="bg-white p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out">
        <p className="text-gray-700">Are you sure you want to delete this doctor?</p>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="px-3 py-1 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors duration-300 ease-in-out transform hover:scale-105"
            onClick={() => {
              console.log('Cancel delete for doctor ID:', doctorId);
              toast.dismiss(t.id);
            }}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 ease-in-out transform hover:scale-105"
            onClick={async () => {
              try {
                console.log('Attempting to delete doctor ID:', doctorId);
                const response = await api.delete(`/doctors/${doctorId}`);
                console.log('Delete response:', response.data);
                setDoctors(doctors.filter((doc) => doc.id !== doctorId));
                toast.success('Doctor deleted successfully');
              } catch (error: any) {
                console.error('Delete error:', error.response?.data || error.message);
                toast.error(error.response?.data?.detail || 'Failed to delete doctor');
              }
              toast.dismiss(t.id);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-100 via-white to-blue-100 py-6 space-y-6">
      <Toaster position="top-center" />
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Doctors</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage doctor profiles and schedules
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add Doctor'}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddDoctor}
          className="mb-6 space-y-4 bg-white p-6 rounded-xl shadow-lg transform transition-all duration-500 ease-in-out opacity-0 translate-y-4"
          style={{ animation: 'fadeInUp 0.5s forwards' }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ease-in-out"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Specialty</label>
            <input
              type="text"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ease-in-out"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Submit
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="overflow-hidden rounded-lg bg-white shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <div className="flex items-center">
                  <div className="h-12 w-12 flex-shrink-0">
                    <User className="h-12 w-12 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Loading doctors...</h3>
                    <p className="text-sm text-gray-500">Please wait...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : doctors.length === 0 ? (
          <div className="overflow-hidden rounded-lg bg-white shadow-lg">
            <div className="p-6">
              <p className="text-sm text-gray-500">No doctors found</p>
            </div>
          </div>
        ) : (
          doctors.map((doctor, index) => (
            <div
              key={doctor.id}
              className="overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-500 ease-in-out transform hover:shadow-xl hover:scale-105"
              style={{ animation: `fadeIn 0.5s ease-in-out ${index * 0.1}s forwards`, opacity: 0 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-12 w-12 flex-shrink-0">
                      <User className="h-12 w-12 text-gray-400 transition-transform duration-300 ease-in-out hover:scale-110" aria-hidden="true" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{doctor.name}</h3>
                      <p className="text-sm text-gray-500">{doctor.specialty}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-800 transition-colors duration-300 ease-in-out transform hover:scale-105"
                    onClick={() => confirmDelete(doctor.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Custom CSS for Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
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