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
  createdAt: string;
}

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  dob: string;
  createdAt: string;
}

interface Stat {
  name: string;
  value: string;
  change: string;
  icon: React.ComponentType<any>;
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
          const today = new Date();
          const currentPeriodStart = subDays(today, 30);
          const previousPeriodStart = subDays(today, 60);
          const previousPeriodEnd = subDays(today, 31);

          const currentPeriodStartStr = format(currentPeriodStart, "yyyy-MM-dd'T'HH:mm:ss'Z'");
          const previousPeriodStartStr = format(previousPeriodStart, "yyyy-MM-dd'T'HH:mm:ss'Z'");
          const previousPeriodEndStr = format(previousPeriodEnd, "yyyy-MM-dd'T'HH:mm:ss'Z'");

          const [patientsRes, appointmentsRes, doctorsRes] = await Promise.all([
            api.get('/patients'),
            api.get('/appointments'),
            api.get('/doctors'),
          ]);

          const allPatients: Patient[] = patientsRes.data;
          const allAppointments: Appointment[] = appointmentsRes.data;
          const allDoctors: Doctor[] = doctorsRes.data;

          const currentPatients = allPatients.filter((patient) => {
            const createdAt = new Date(patient.createdAt);
            return createdAt >= currentPeriodStart && createdAt <= today;
          });
          const previousPatients = allPatients.filter((patient) => {
            const createdAt = new Date(patient.createdAt);
            return createdAt >= previousPeriodStart && createdAt <= previousPeriodEnd;
          });

          const currentAppointments = allAppointments.filter((appt) => {
            const dateTime = new Date(appt.dateTime);
            return dateTime >= currentPeriodStart && dateTime <= today;
          });
          const previousAppointments = allAppointments.filter((appt) => {
            const dateTime = new Date(appt.dateTime);
            return dateTime >= previousPeriodStart && dateTime <= previousPeriodEnd;
          });

          const currentDoctors = allDoctors.filter((doctor) => {
            const createdAt = new Date(doctor.createdAt);
            return createdAt >= currentPeriodStart && createdAt <= today;
          });
          const previousDoctors = allDoctors.filter((doctor) => {
            const createdAt = new Date(doctor.createdAt);
            return createdAt >= previousPeriodStart && createdAt <= previousPeriodEnd;
          });

          const calculatePercentageChange = (current: number, previous: number): string => {
            if (previous === 0) {
              if (current === 0) return '0%';
              return current > 0 ? '+100%' : '0%';
            }
            const change = ((current - previous) / previous) * 100;
            const roundedChange = Number(change.toFixed(2));
            return `${roundedChange > 0 ? '+' : ''}${roundedChange}%`;
          };

          const patientsChange = calculatePercentageChange(currentPatients.length, previousPatients.length);
          const appointmentsChange = calculatePercentageChange(currentAppointments.length, previousAppointments.length);
          const doctorsChange = calculatePercentageChange(currentDoctors.length, previousDoctors.length);

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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-100 via-white to-blue-100 py-6 space-y-6">
      <Toaster position="top-center" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change.startsWith('+') && stat.change !== '+0%';
          const isNegative = stat.change.startsWith('-');
          return (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow-lg sm:px-6 sm:pt-6 transition-all duration-500 ease-in-out transform hover:shadow-xl hover:scale-105"
              style={{ animation: `fadeIn 0.5s ease-in-out ${index * 0.1}s forwards`, opacity: 0 }}
            >
              <dt>
                <div className="absolute rounded-md bg-blue-500 p-3">
                  <Icon className="h-6 w-6 text-white transition-transform duration-300 ease-in-out hover:scale-110" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
                {/* <p
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
                  }`}
                >
                  {stat.change}
                </p> */}
              </dd>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-white shadow-lg">
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
                        <div className="flex items-center justify-center space-x-2 p-4">
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
                          <p className="text-sm text-gray-500">Loading appointments...</p>
                        </div>
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
                            {appointments.map((appointment, index) => (
                              <tr
                                key={appointment.id}
                                className="transition-all duration-500 ease-in-out transform hover:bg-blue-50 hover:shadow-md"
                                style={{ animation: `fadeIn 0.5s ease-in-out ${index * 0.1}s forwards`, opacity: 0 }}
                              >
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

        <div className="overflow-hidden rounded-lg bg-white shadow-lg">
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
                        <div className="flex items-center justify-center space-x-2 p-4">
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
                          <p className="text-sm text-gray-500">Loading doctor schedules...</p>
                        </div>
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
                          <tbody className="bg-white divide-y divide-gradient-200">
                            {doctors.map((doctor, index) => (
                              <tr
                                key={doctor.id}
                                className="transition-all duration-500 ease-in-out transform hover:bg-blue-50 hover:shadow-md"
                                style={{ animation: `fadeIn 0.5s ease-in-out ${index * 0.1}s forwards`, opacity: 0 }}
                              >
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
        `}
      </style>
    </div>
  );
}