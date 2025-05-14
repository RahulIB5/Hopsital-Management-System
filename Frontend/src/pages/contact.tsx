import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for form submission logic
    console.log('Form submitted:', formData);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Gradient Header */}
      <header className="bg-gradient-to-r from-blue-400 to-blue-600 shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-white">Contact Us</h1>
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Have questions about MediNex or want to schedule a demo? Reach out to our team, and we’ll get back to you promptly.
          </p>
        </section>

        {/* Contact Form and Details */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Send Us a Message</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={5}
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-500 hover:to-blue-700 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Details */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h3>
            <p className="text-gray-600 mb-4">
              Reach out to us directly or visit our office for a consultation.
            </p>
            <ul className="space-y-4">
              <li>
                <strong className="text-gray-900">Address:</strong> MediNex Solutions, Electronic City, Bengaluru-80
              </li>
              <li>
                <strong className="text-gray-900">Phone:</strong> +91 123 456 7890
              </li>
              <li>
                <strong className="text-gray-900">Email:</strong> support@medinex.com
              </li>
              <li>
                <strong className="text-gray-900">Hours:</strong> Monday–Friday, 9:00 AM–6:00 PM
              </li>
            </ul>
            {/* Map Placeholder
            <div className="mt-6 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-600">[Google Map Placeholder]</p>
            </div> */}
          </div>
        </section>
      </main>

    </div>
  );
}