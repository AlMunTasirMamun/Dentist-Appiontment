import DoctorList from '@/components/doctors/DoctorList';

export const metadata = {
    title: 'Our Doctors | DentCare',
    description: 'Browse our expert dental professionals and book your appointment.',
};

export default function DoctorsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Our <span className="gradient-text">Expert Dentists</span>
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Choose from our team of qualified dental professionals.
                        Each doctor brings years of experience and a commitment to your dental health.
                    </p>
                </div>

                {/* Doctor List */}
                <DoctorList />
            </div>
        </div>
    );
}
