import { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import api from '../lib/axios';
import toast, { Toaster, toast as toastFunc } from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { AxiosResponse } from 'axios';

interface Appointment {
  id: number;
  patient: { id: number; name: string; phone: string; email: string } | null;
  doctor: { id: number; name: string; specialty: string } | null;
  dateTime: string;
  status: string;
  purpose: string | null;
}

interface Patient {
  id: number;
  name: string;
  phone: string;
  email: string;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    patientId: '',
    doctorId: '',
    dateTime: '',
    status: 'Scheduled',
    purpose: '',
  });
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    } else {
      const fetchData = async () => {
        try {
          const [appointmentsRes, patientsRes, doctorsRes] = await Promise.all([
            api.get('/appointments'),
            api.get('/patients'),
            api.get('/doctors'),
          ]);
          setAppointments(appointmentsRes.data);
          setPatients(patientsRes.data);
          setDoctors(doctorsRes.data);
        } catch (error: any) {
          console.error('Error fetching data:', error);
          toast.error(error.response?.data?.detail || 'Failed to fetch data');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [navigate, isAuthenticated]);

  const handleAddOrEditAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isoDateTime = new Date(formData.dateTime).toISOString();
      const data = {
        patientId: Number(formData.patientId),
        doctorId: Number(formData.doctorId),
        dateTime: isoDateTime,
        status: formData.status,
        purpose: formData.purpose || null,
      };
      console.log('Submitting appointment data:', data);
      let response: AxiosResponse<any, any>;
      if (editing) {
        response = await api.put(`/appointments/${formData.id}`, data);
        console.log('PUT response:', response.data);
        setAppointments(appointments.map((app) =>
          app.id === formData.id ? response.data : app
        ));
        toast.success('Appointment updated successfully. SMS and email sent to patient.');
      } else {
        response = await api.post('/appointments', data);
        console.log('POST response:', response.data);
        const existingAppointment = appointments.find(
          (app) =>
            app.patient?.id === data.patientId &&
            app.doctor?.id === data.doctorId &&
            app.dateTime === isoDateTime
        );
        if (existingAppointment) {
          setAppointments(
            appointments.map((app) =>
              app.id === existingAppointment.id ? response.data : app
            )
          );
          toast.success('Appointment status updated to Confirmed. SMS and email sent to patient.');
        } else {
          setAppointments([...appointments, response.data]);
          toast.success('Appointment added successfully. SMS and email sent to patient.');
        }
      }
      setFormData({ id: 0, patientId: '', doctorId: '', dateTime: '', status: 'Scheduled', purpose: '' });
      setShowForm(false);
      setEditing(false);
    } catch (error: any) {
      console.error('Error adding/updating appointment:', error.response?.data || error.message);
      toast.error(error.response?.data?.detail || 'Failed to add/update appointment');
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditing(true);
    setShowForm(true);
    setFormData({
      id: appointment.id,
      patientId: appointment.patient?.id.toString() || '',
      doctorId: appointment.doctor?.id.toString() || '',
      dateTime: new Date(appointment.dateTime).toISOString().slice(0, -8),
      status: appointment.status,
      purpose: appointment.purpose || '',
    });
  };

  const confirmDelete = (appointmentId: number) => {
    console.log('Delete button clicked for appointment ID:', appointmentId);
    toastFunc((t) => (
      <div className="bg-white p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out">
        <p className="text-gray-700">Are you sure you want to delete this appointment?</p>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="px-3 py-1 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors duration-300 ease-in-out transform hover:scale-105"
            onClick={() => {
              console.log('Cancel delete for appointment ID:', appointmentId);
              toast.dismiss(t.id);
            }}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 ease-in-out transform hover:scale-105"
            onClick={async () => {
              try {
                console.log('Attempting to delete appointment ID:', appointmentId);
                const response = await api.delete(`/appointments/${appointmentId}`);
                console.log('Delete response:', response.data);
                setAppointments(appointments.filter((app) => app.id !== appointmentId));
                toast.success('Appointment deleted successfully');
              } catch (error: any) {
                console.error('Delete error:', error.response?.data || error.message);
                toast.error(error.response?.data?.detail || 'Failed to delete appointment');
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

  const handleToggleForm = () => {
    if (showForm) {
      setShowForm(false);
      setEditing(false);
      setFormData({ id: 0, patientId: '', doctorId: '', dateTime: '', status: 'Scheduled', purpose: '' });
    } else {
      if (isAuthenticated()) {
        setShowForm(true);
        setEditing(false);
        setFormData({ id: 0, patientId: '', doctorId: '', dateTime: '', status: 'Scheduled', purpose: '' });
      } else {
        navigate('/login');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-blue to-blue-200 py-6 space-y-6">
      <Toaster position="top-center" />
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            Appointments
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage and schedule patient appointments
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105"
            onClick={handleToggleForm}
          >
            {showForm ? 'Cancel' : 'Add Appointment'}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddOrEditAppointment}
          className="mb-6 space-y-4 bg-white p-6 rounded-xl shadow-lg transform transition-all duration-500 ease-in-out opacity-0 translate-y-4"
          style={{ animation: 'fadeInUp 0.5s forwards' }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">Patient</label>
            <select
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ease-in-out"
              required
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Doctor</label>
            <select
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ease-in-out"
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} ({doctor.specialty})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date & Time</label>
            <input
              type="datetime-local"
              value={formData.dateTime}
              onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ease-in-out"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ease-in-out"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Purpose</label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ease-in-out"
              placeholder="e.g., Routine Checkup"
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            {editing ? 'Update' : 'Submit'}
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="p-6">
          <div className="flex flex-col">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          <div className="flex items-center">
                            <User className="mr-2 h-5 w-5 text-gray-400 transition-transform duration-300 ease-in-out hover:scale-110" />
                            Patient
                          </div>
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          <div className="flex items-center">
                            <User className="mr-2 h-5 w-5 text-gray-400 transition-transform duration-300 ease-in-out hover:scale-110" />
                            Doctor
                          </div>
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-5 w-5 text-gray-400 transition-transform duration-300 ease-in-out hover:scale-110" />
                            Date
                          </div>
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          <div className="flex items-center">
                            <Clock className="mr-2 h-5 w-5 text-gray-400 transition-transform duration-300 ease-in-out hover:scale-110" />
                            Status
                          </div>
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          <div className="flex items-center">
                            <FileText className="mr-2 h-5 w-5 text-gray-400 transition-transform duration-300 ease-in-out hover:scale-110" />
                            Purpose
                          </div>
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
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
                              <span>Loading appointments...</span>
                            </div>
                          </td>
                        </tr>
                      ) : appointments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                            No appointments found
                          </td>
                        </tr>
                      ) : (
                        appointments.map((appointment, index) => (
                          <tr
                            key={appointment.id}
                            className="transition-all duration-500 ease-in-out transform hover:bg-blue-50 hover:shadow-md"
                            style={{ animation: `fadeIn 0.5s ease-in-out ${index * 0.1}s forwards`, opacity: 0 }}
                          >
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {appointment.patient ? appointment.patient.name : 'Unknown Patient'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {appointment.doctor ? `${appointment.doctor.name} (${appointment.doctor.specialty})` : 'Unknown Doctor'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {format(new Date(appointment.dateTime), 'MMM d, yyyy h:mm a')}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {appointment.status}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {appointment.purpose || 'N/A'}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <button
                                type="button"
                                className="text-blue-600 hover:text-blue-800 mr-4 transition-colors duration-300 ease-in-out transform hover:scale-105"
                                onClick={() => handleEdit(appointment)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="text-red-600 hover:text-red-800 transition-colors duration-300 ease-in-out transform hover:scale-105"
                                onClick={() => confirmDelete(appointment.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
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