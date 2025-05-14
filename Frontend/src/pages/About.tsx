import { Link } from 'react-router-dom';

export default function About() {
  // Team data with name, role, and image URL
  const teamMembers = [
    {
      name: 'Dr. Swati',
      role: 'Chief Medical Advisor and COO',
      image: "../public/swati.avif", // Replace with actual image path, e.g., '/images/drswati.jpg'
    },
    {
      name: 'Mr. Sharath',
      role: 'Lead Software Engineer and CTO',
      image: "../public/yash.jpg",
    },
    {
      name: 'Hon. Shivkumar',
      role: 'Head of Customer Success and CEO',
      image: '../public/shivkumar.avif',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Gradient Header */}
      <header className="bg-gradient-to-r from-blue-400 to-blue-600 shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-white">About MediNex</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <section className="text-center mb-12">
          <img
            src="/logo.avif"
            alt="Medical Dashboard Logo"
            className="h-20 w-20 object-contain rounded-full mx-auto mb-4"
          />
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Who We Are</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            MediNex is a leading provider of hospital management systems, dedicated to transforming healthcare operations through innovative technology. Our mission is to streamline hospital workflows, enhance patient care, and empower healthcare professionals with intuitive, efficient tools.
          </p>
        </section>

        {/* Mission and Vision */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-600">
              To deliver cutting-edge hospital management solutions that optimize operations, reduce administrative burdens, and improve patient outcomes, making healthcare accessible and efficient for all.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Our Vision</h3>
            <p className="text-gray-600">
              To be the global leader in healthcare technology, empowering hospitals and clinics with smart, scalable systems that drive innovation and excellence in patient care.
            </p>
          </div>
        </section>

        {/* Our Team */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Team</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            MediNex is powered by a team of healthcare professionals, software engineers, and industry experts who are passionate about revolutionizing hospital management. Together, we bring decades of experience to deliver solutions that meet the unique needs of healthcare facilities.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow">
                <img
                  src={member.image}
                  alt={`${member.name} profile`}
                  className="h-24 w-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}