'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { createContactMessage } from '@/services/contactService';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      await createContactMessage(formData);
      setStatus({ type: 'success', message: 'Message sent successfully! We will get back to you soon.' });
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Something went wrong. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-teal-500 rounded-full blur-3xl opacity-10" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-400 rounded-full blur-3xl opacity-10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
                A Warm Welcome and a Beautiful{' '}
                <span className="text-teal-400">Smile!</span>
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-lg">
                Welcome to our dental clinic where your comfort and health are our top priorities.
                Experience exceptional care with our team of expert dentists.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/doctors">
                  <Button size="lg" className="bg-teal-500 text-white hover:bg-teal-600 border-none">
                    Book Appointment
                  </Button>
                </Link>
                <Link href="/doctors">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    View Doctors
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="relative w-[400px] h-[300px] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/dental-chair.jpg"
                    alt="Modern dental clinic"
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards Section */}
      <section className="py-8 mt-8 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Opening Hours */}
            <div className="bg-teal-600 text-white rounded-2xl p-6 shadow-xl flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">Opening Hours</h3>
                <p className="text-teal-100 text-sm">Open 9.00 am to 5pm Everyday</p>
              </div>
            </div>

            {/* Our Location */}
            <div className="bg-teal-500 text-white rounded-2xl p-6 shadow-xl flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">Our Location</h3>
                <p className="text-teal-100 text-sm">Brooklyn, NY 10036, United States</p>
              </div>
            </div>

            {/* Contact Us */}
            <div className="bg-orange-500 text-white rounded-2xl p-6 shadow-xl flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">Contact Us Now</h3>
                <p className="text-orange-100 text-sm">+1 315 369 5943</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-teal-600 font-semibold mb-2 uppercase tracking-wide">Our Services</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Services We Provide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="text-center p-8 rounded-2xl hover:shadow-xl transition-shadow bg-gray-50">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fluoride Treatment</h3>
              <p className="text-gray-600">
                Protect your teeth with our professional fluoride treatments that strengthen enamel and prevent decay.
              </p>
            </div>

            {/* Service 2 */}
            <div className="text-center p-8 rounded-2xl hover:shadow-xl transition-shadow bg-gray-50">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cavity Filling</h3>
              <p className="text-gray-600">
                Expert cavity treatment with modern materials that match your natural tooth color seamlessly.
              </p>
            </div>

            {/* Service 3 */}
            <div className="text-center p-8 rounded-2xl hover:shadow-xl transition-shadow bg-gray-50">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Teeth Whitening</h3>
              <p className="text-gray-600">
                Achieve a brighter smile with our professional teeth whitening services using safe techniques.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Exceptional Dental Care */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Images */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="/dental-procedure.jpg"
                    alt="Dental procedure"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-xl mt-8">
                  <Image
                    src="/doc.jpg"
                    alt="Professional dentist"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Exceptional Dental Care, on Your Terms
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                At DentCare, we believe everyone deserves access to quality dental care. Our team of experienced
                professionals uses the latest technology to provide comfortable, effective treatments tailored to your needs.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                From routine checkups to advanced procedures, we&apos;re committed to helping you achieve and maintain
                a healthy, beautiful smile in a welcoming environment.
              </p>
              <Link href="/doctors">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Appointment CTA Section */}
      <section className="py-20 bg-dark-teal text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Doctor Image */}
            <div className="hidden md:flex justify-center">
              <div className="relative w-[350px] h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/doc.jpg"
                  alt="Professional dentist"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <p className="text-teal-400 font-semibold mb-2 uppercase tracking-wide">Appointment</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Make An Appointment Today!
              </h2>
              <p className="text-gray-300 mb-8 leading-relaxed">
                Don&apos;t wait to take care of your dental health. Book an appointment with our expert dentists
                and experience the difference of personalized, compassionate care. Our friendly team is ready
                to help you achieve your healthiest smile.
              </p>
              <Link href="/doctors">
                <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white">
                  Book An Appointment Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <p className="text-teal-600 font-semibold mb-2 uppercase tracking-wide">Testimonials</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                What Our Patients Says
              </h2>
            </div>
            <div className="text-teal-200 text-8xl font-serif hidden md:block">&quot;</div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <p className="text-gray-600 mb-6 leading-relaxed">
                &quot;Excellent service and very professional staff. The dentist explained everything clearly
                and made me feel comfortable throughout my treatment. Highly recommended!&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">WH</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">William Henry</h4>
                  <p className="text-gray-500 text-sm">Patient</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <p className="text-gray-600 mb-6 leading-relaxed">
                &quot;I was nervous about my dental appointment but the team here made it such a pleasant experience.
                The clinic is modern and clean. Great results with my teeth whitening!&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">MJ</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Michael Jerry</h4>
                  <p className="text-gray-500 text-sm">Patient</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <p className="text-gray-600 mb-6 leading-relaxed">
                &quot;Best dental clinic in the area! The staff is friendly and the appointments are always on time.
                I&apos;ve been coming here for years and wouldn&apos;t go anywhere else.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">AJ</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Alice Johnson</h4>
                  <p className="text-gray-500 text-sm">Patient</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-teal-600 font-semibold mb-2 uppercase tracking-wide">Contact Us</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get In Touch With Us
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {status.message && (
                <div className={`p-4 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {status.message}
                </div>
              )}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Enter your message"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition resize-none"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
