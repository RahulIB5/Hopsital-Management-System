import { useState, useEffect } from 'react';
import { Calendar, Clock, User } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuthStore } from '../stores/authStore'; // Import auth store

interface Appointment {
  id: number;
  patient: { id: number; name: string } | null;
  doctor: { id: number; name: string } | null;
  dateTime: string;
  status: string;
}

interface Patient {
  id: number;
  name: string;
}

interface Doctor {
  id: number;
  name: string;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    dateTime: '',
    status: 'Scheduled',
  });

  useEffect(() => {
    console.log('Current token:', useAuthStore.getState().token);
    const fetchData = async () => {
      try {
        const promises = [
          api.get('/appointments').catch((err) => ({ error: err, data: [] })),
          api.get('/patients').catch((err) => ({ error: err, data: [] })),
          api.get('/doctors').catch((err) => ({ error: err, data: [] })),
        ];
        const [appointmentsRes, patientsRes, doctorsRes] = await Promise.all(promises);

        if ('error' in appointmentsRes) {
          console.error('Appointments fetch error:', appointmentsRes.error);
          toast.error('Failed to fetch appointments');
        } else {
          setAppointments(appointmentsRes.data);
        }

        if ('error' in patientsRes) {
          console.error('Patients fetch error:', patientsRes.error);
          toast.error('Failed to fetch patients');
        } else {
          setPatients(patientsRes.data);
        }

        if ('error' in doctorsRes) {
          console.error('Doctors fetch error:', doctorsRes.error);
          toast.error('Failed to fetch doctors');
        } else {
          setDoctors(doctorsRes.data);
        }
      } catch (error: any) {
        console.error('Unexpected error fetching data:', error);
        toast.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isoDateTime = new Date(formData.dateTime).toISOString();
      console.log('Sending appointment data:', {
        patientId: Number(formData.patientId),
        doctorId: Number(formData.doctorId),
        dateTime: isoDateTime,
        status: formData.status,
      });
      const response = await api.post('/appointments', {
        patientId: Number(formData.patientId),
        doctorId: Number(formData.doctorId),
        dateTime: isoDateTime,
        status: formData.status,
      });
      setAppointments([...appointments, response.data]);
      setFormData({ patientId: '', doctorId: '', dateTime: '', status: 'Scheduled' });
      setShowForm(false);
      toast.success('Appointment added successfully');
    } catch (error: any) {
      console.error('Error adding appointment:', error);
      toast.error(error.response?.data?.detail || 'Failed to add appointment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and schedule patient appointments
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add Appointment'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAddAppointment} className="mb-4 space-y-4 bg-white p-6 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium text-gray-700">Patient</label>
            <select
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="">Select Patient</option>
              {patients.length === 0 && (
                <option value="" disabled>
                  No patients available
                </option>
              )}
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
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="">Select Doctor</option>
              {doctors.length === 0 && (
                <option value="" disabled>
                  No doctors available
                </option>
              )}
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
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
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Submit
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="p-6">
          <div className="flex flex-col">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          Patient
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Doctor
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Date
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                            Loading appointments...
                          </td>
                        </tr>
                      ) : appointments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                            No appointments found
                          </td>
                        </tr>
                      ) : (
                        appointments.map((appointment) => (
                          <tr key={appointment.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {appointment.patient ? appointment.patient.name : 'Unknown Patient'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {appointment.doctor ? appointment.doctor.name : 'Unknown Doctor'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {format(new Date(appointment.dateTime), 'MMM d, yyyy h:mm a')}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {appointment.status}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <button
                                type="button"
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
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
    </div>
  );
}