import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/axios';
import toast, { Toaster, toast as toastFunc } from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { AxiosResponse } from 'axios';

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  dob: string;
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    email: '',
    phone: '',
    dob: '',
  });
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    } else {
      const fetchPatients = async () => {
        try {
          const response = await api.get('/patients');
          setPatients(response.data);
        } catch (error: any) {
          console.error('Error fetching patients:', error);
          toast.error(error.response?.data?.detail || 'Failed to fetch patients');
        } finally {
          setLoading(false);
        }
      };
      fetchPatients();
    }
  }, [navigate, isAuthenticated]);

  const handleAddOrEditPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        dob: formData.dob,
      };
      let response: AxiosResponse<any, any>;
      if (editing) {
        response = await api.put(`/patients/${formData.id}`, data);
        setPatients(patients.map((pat) => (pat.id === formData.id ? response.data : pat)));
        toast.success('Patient updated successfully');
      } else {
        response = await api.post('/patients', data);
        setPatients([...patients, response.data]);
        toast.success('Patient added successfully');
      }
      setFormData({ id: 0, name: '', email: '', phone: '', dob: '' });
      setShowForm(false);
      setEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add/update patient');
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditing(true);
    setShowForm(true);
    setFormData({
      id: patient.id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone || '',
      dob: patient.dob,
    });
  };

  const confirmDelete = (patientId: number) => {
    console.log('Delete button clicked for patient ID:', patientId);
    toastFunc((t) => (
      <div className="bg-white p-4 rounded shadow-lg">
        <p className="text-gray-700">Are you sure you want to delete this patient?</p>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            onClick={() => {
              console.log('Cancel delete for patient ID:', patientId);
              toast.dismiss(t.id);
            }}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={async () => {
              try {
                console.log('Attempting to delete patient ID:', patientId);
                const response = await api.delete(`/patients/${patientId}`);
                console.log('Delete response:', response.data);
                setPatients(patients.filter((p) => p.id !== patientId));
                toast.success('Patient deleted successfully');
              } catch (error: any) {
                console.error('Delete error:', error.response?.data || error.message);
                toast.error(error.response?.data?.detail || 'Failed to delete patient');
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
    <div className="space-y-6">
      <Toaster position="top-center" />
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage patient records
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
            onClick={() => {
              setShowForm(true);
              setEditing(false);
              setFormData({ id: 0, name: '', email: '', phone: '', dob: '' });
            }}
          >
            {showForm ? 'Cancel' : 'Add Patient'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAddOrEditPatient} className="mb-4 space-y-4 bg-white p-6 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
              disabled={editing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            {editing ? 'Update' : 'Submit'}
          </button>
        </form>
      )}

      <div className="flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      <div className="flex items-center">
                        <User className="mr-2 h-5 w-5 text-gray-400" />
                        Name
                      </div>
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Phone
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Date of Birth
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
                        Loading patients...
                      </td>
                    </tr>
                  ) : patients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                        No patients found
                      </td>
                    </tr>
                  ) : (
                    patients.map((patient) => (
                      <tr key={patient.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {patient.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {patient.email}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {patient.phone || '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {format(new Date(patient.dob), 'MMM d, yyyy')}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-900 mr-2"
                            onClick={() => handleEdit(patient)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-900"
                            onClick={() => confirmDelete(patient.id)}
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
  );
}