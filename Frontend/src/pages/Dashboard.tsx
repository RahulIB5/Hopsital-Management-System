import { useState, useEffect } from 'react';
import { Users, Calendar, Activity } from 'lucide-react';
import api from '../lib/axios';
import toast, { Toaster } from 'react-hot-toast';
import { format, subDays } from 'date-fns';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

// Define interfaces
interface Appointment {
  id: number;
  patient: { id: number; name: string } | null;
  doctor: { id: number; name: string } | null;
  dateTime: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  createdAt: string; // Assuming this field exists
}

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  dob: string;
  createdAt: string; // Assuming this field exists
}

interface Stat {
  name: string;
  value: string;
  change: string;
  icon: React.ComponentType<any>; // Use a more permissive type or import LucideProps from lucide-react
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stat[]>([
    { name: 'Total Patients', value: '0', change: '0%', icon: Users },
    { name: 'Total Appointments', value: '0', change: '0%', icon: Calendar },
    { name: 'Active Doctors', value: '0', change: '0%', icon: Activity },
  ]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    } else {
      const fetchData = async () => {
        try {
          // Define date ranges
          const today = new Date();
          const currentPeriodStart = subDays(today, 30); // Last 30 days
          const previousPeriodStart = subDays(today, 60); // 60 to 30 days ago
          const previousPeriodEnd = subDays(today, 31);

          // Format dates for API queries (ISO 8601)
          const currentPeriodStartStr = format(currentPeriodStart, "yyyy-MM-dd'T'HH:mm:ss'Z'");
          const previousPeriodStartStr = format(previousPeriodStart, "yyyy-MM-dd'T'HH:mm:ss'Z'");
          const previousPeriodEndStr = format(previousPeriodEnd, "yyyy-MM-dd'T'HH:mm:ss'Z'");

          // Fetch all data (no date filter for patients and doctors, we'll filter on frontend)
          const [patientsRes, appointmentsRes, doctorsRes] = await Promise.all([
            api.get('/patients'),
            api.get('/appointments'),
            api.get('/doctors'),
          ]);

          const allPatients: Patient[] = patientsRes.data;
          const allAppointments: Appointment[] = appointmentsRes.data;
          const allDoctors: Doctor[] = doctorsRes.data;

          // Filter patients for current and previous periods
          const currentPatients = allPatients.filter((patient) => {
            const createdAt = new Date(patient.createdAt);
            return createdAt >= currentPeriodStart && createdAt <= today;
          });
          const previousPatients = allPatients.filter((patient) => {
            const createdAt = new Date(patient.createdAt);
            return createdAt >= previousPeriodStart && createdAt <= previousPeriodEnd;
          });

          // Filter appointments for current and previous periods
          const currentAppointments = allAppointments.filter((appt) => {
            const dateTime = new Date(appt.dateTime);
            return dateTime >= currentPeriodStart && dateTime <= today;
          });
          const previousAppointments = allAppointments.filter((appt) => {
            const dateTime = new Date(appt.dateTime);
            return dateTime >= previousPeriodStart && dateTime <= previousPeriodEnd;
          });

          // Filter doctors for current and previous periods
          const currentDoctors = allDoctors.filter((doctor) => {
            const createdAt = new Date(doctor.createdAt);
            return createdAt >= currentPeriodStart && createdAt <= today;
          });
          const previousDoctors = allDoctors.filter((doctor) => {
            const createdAt = new Date(doctor.createdAt);
            return createdAt >= previousPeriodStart && createdAt <= previousPeriodEnd;
          });

          // Calculate percentage changes
          const calculatePercentageChange = (current: number, previous: number): string => {
            if (previous === 0) {
              if (current === 0) return '0%';
              return current > 0 ? '+100%' : '0%'; // Handle edge case
            }
            const change = ((current - previous) / previous) * 100;
            const roundedChange = Number(change.toFixed(2));
            return `${roundedChange > 0 ? '+' : ''}${roundedChange}%`;
          };

          const patientsChange = calculatePercentageChange(currentPatients.length, previousPatients.length);
          const appointmentsChange = calculatePercentageChange(currentAppointments.length, previousAppointments.length);
          const doctorsChange = calculatePercentageChange(currentDoctors.length, previousDoctors.length);

          // Update stats with total values and percentage changes
          setStats([
            { 
              name: 'Total Patients', 
              value: allPatients.length.toString(), 
              change: patientsChange, 
              icon: Users 
            },
            { 
              name: 'Total Appointments', 
              value: allAppointments.length.toString(), 
              change: appointmentsChange, 
              icon: Calendar 
            },
            { 
              name: 'Active Doctors', 
              value: allDoctors.length.toString(), 
              change: doctorsChange, 
              icon: Activity 
            },
          ]);

          // Set recent appointments (last 5)
          setAppointments(allAppointments.slice(0, 5));
          setDoctors(allDoctors);
        } catch (error: any) {
          console.error('Unexpected error fetching dashboard data:', error);
          toast.error('Failed to fetch dashboard data');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [navigate, isAuthenticated]);

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change.startsWith('+') && stat.change !== '+0%';
          const isNegative = stat.change.startsWith('-');
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
                <p
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
                  }`}
                >
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