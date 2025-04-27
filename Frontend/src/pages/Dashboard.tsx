import { useState, useEffect } from 'react';
import { BarChart, Users, Calendar, Activity } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuthStore } from '../stores/authStore';

interface Appointment {
  id: number;
  patient: { id: number; name: string } | null;
  doctor: { id: number; name: string } | null;
  dateTime: string;
  status: string;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState([
    { name: 'Total Patients', value: '0', change: '0%', icon: Users },
    { name: 'Total Appointments', value: '0', change: '0%', icon: Calendar },
    { name: 'Active Doctors', value: '0', change: '0%', icon: Activity },
  ]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Current token:', useAuthStore.getState().token);
    const fetchData = async () => {
      try {
        const promises = [
          api.get('/patients').catch((err) => ({ error: err, data: [] })),
          api.get('/appointments').catch((err) => ({ error: err, data: [] })),
          api.get('/doctors').catch((err) => ({ error: err, data: [] })),
        ];
        const [patientsRes, appointmentsRes, doctorsRes] = await Promise.all(promises);

        if ('error' in patientsRes) {
          console.error('Patients fetch error:', patientsRes.error);
          toast.error('Failed to fetch patients');
        }
        if ('error' in appointmentsRes) {
          console.error('Appointments fetch error:', appointmentsRes.error);
          toast.error('Failed to fetch appointments');
        }
        if ('error' in doctorsRes) {
          console.error('Doctors fetch error:', doctorsRes.error);
          toast.error('Failed to fetch doctors');
        }

        setStats([
          { name: 'Total Patients', value: patientsRes.data.length.toString(), change: '0%', icon: Users },
          { name: 'Total Appointments', value: appointmentsRes.data.length.toString(), change: '0%', icon: Calendar },
          { name: 'Active Doctors', value: doctorsRes.data.length.toString(), change: '0%', icon: Activity },
        ]);
        setAppointments(appointmentsRes.data.slice(0, 5));
        setDoctors(doctorsRes.data);
      } catch (error: any) {
        console.error('Unexpected error fetching dashboard data:', error);
        toast.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
            >
              <dt>
                <div className="absolute rounded-md bg-blue-500 p-3">
                  <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
                <p className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                  {stat.change}
                </p>
              </dd>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Recent Appointments
            </h3>
            <div className="mt-6">
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden border-b border-gray-200">
                      {loading ? (
                        <p className="text-sm text-gray-500 p-4">Loading appointments...</p>
                      ) : appointments.length === 0 ? (
                        <p className="text-sm text-gray-500 p-4">No recent appointments</p>
                      ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {appointments.map((appointment) => (
                              <tr key={appointment.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {appointment.patient ? appointment.patient.name : 'Unknown Patient'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {appointment.doctor ? appointment.doctor.name : 'Unknown Doctor'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {format(new Date(appointment.dateTime), 'MMM d, yyyy h:mm a')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Doctor Availability
            </h3>
            <div className="mt-6">
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden border-b border-gray-200">
                      {loading ? (
                        <p className="text-sm text-gray-500 p-4">Loading doctor schedules...</p>
                      ) : doctors.length === 0 ? (
                        <p className="text-sm text-gray-500 p-4">No doctors available</p>
                      ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialty</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {doctors.map((doctor) => (
                              <tr key={doctor.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {doctor.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {doctor.specialty}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}