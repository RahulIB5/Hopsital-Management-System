import { Link } from 'react-router-dom';

export default function Services() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Gradient Header */}
      <header className="bg-gradient-to-r from-blue-400 to-blue-600 shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-white">Our Services</h1>
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">MediNex Solutions</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            MediNex offers a comprehensive hospital management system designed to streamline operations, enhance patient care, and improve efficiency. Explore our key modules below to see how we can transform your healthcare facility.
          </p>
        </section>

        {/* Services Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Patient Management</h3>
            <p className="text-gray-600">
              Efficiently manage patient records, medical histories, and demographics with our secure, user-friendly platform, ensuring quick access for healthcare providers.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Appointment Scheduling</h3>
            <p className="text-gray-600">
              Simplify appointment booking with an intuitive system that supports online scheduling, automated reminders, and multi-location management.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Billing & Invoicing</h3>
            <p className="text-gray-600">
              Automate billing processes, generate accurate invoices, and integrate with insurance systems to reduce errors and improve financial efficiency.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Inventory Management</h3>
            <p className="text-gray-600">
              Track medical supplies, manage stock levels, and receive low-stock alerts to ensure your facility is always prepared.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Reporting & Analytics</h3>
            <p className="text-gray-600">
              Gain insights with customizable reports and real-time analytics on patient care, operations, and financial performance.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Telemedicine Integration</h3>
            <p className="text-gray-600">
              Enable virtual consultations with seamless telemedicine integration, connecting patients and providers remotely.
            </p>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Transform Your Hospital?</h2>
          <p className="text-lg text-gray-600 mb-6">
            Contact us today to schedule a demo and see how MediNex can streamline your operations.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-500 hover:to-blue-700 transition-colors"
          >
            Get in Touch
          </Link>
        </section>
      </main>
      
    </div>
  );
}