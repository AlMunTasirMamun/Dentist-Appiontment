import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-400 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Your Smile, <br />
                <span className="text-cyan-300">Our Priority</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-lg">
                Book your dental appointment online with our expert dentists.
                Easy scheduling, quality care, and the smile you deserve.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/doctors">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
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
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-[2.5rem] opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-500" />
                <div className="relative bg-white/10 backdrop-blur-md rounded-[2rem] p-4 border border-white/20 shadow-2xl overflow-hidden">
                  <div className="relative w-[340px] h-[440px] rounded-2xl overflow-hidden border border-white/10">
                    <Image
                      src="/doc.jpg"
                      alt="Doctor holding dental tools"
                      fill
                      priority
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="gradient-text">DentCare</span>?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We make dental care accessible, convenient, and stress-free for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Booking</h3>
              <p className="text-gray-600">
                Book appointments online anytime, anywhere. No phone calls, no waiting.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Dentists</h3>
              <p className="text-gray-600">
                Our team of qualified dental professionals ensure you get the best care.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Guest Booking</h3>
              <p className="text-gray-600">
                No account required! Book as a guest and register later if you want.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Book your appointment today and take the first step towards a healthier smile.
          </p>
          <Link href="/doctors">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl">
              Find a Dentist
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">500+</div>
              <div className="text-gray-600">Happy Patients</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">20+</div>
              <div className="text-gray-600">Expert Dentists</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">1000+</div>
              <div className="text-gray-600">Appointments</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">99%</div>
              <div className="text-gray-600">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
