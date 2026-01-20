import Link from 'next/link';
import Image from 'next/image';
import Button from '../ui/Button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const DoctorCard = ({ doctor }) => {
    const imageUrl = doctor.image ? `${API_URL.replace('/api', '')}${doctor.image}` : null;

    return (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            {/* Image */}
            <div className="relative h-68 bg-gradient-to-br from-blue-100 to-cyan-100 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={doctor.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            unoptimized
                        />
                    ) : (
                        <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <span className="text-3xl font-bold text-white">
                                {doctor.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${doctor.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {doctor.status === 'active' ? 'Available' : 'Unavailable'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Dr. {doctor.name}
                </h3>
                <p className="text-blue-600 font-medium mb-3">
                    {doctor.specialty}
                </p>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {doctor.bio || 'Experienced dental professional committed to providing excellent care.'}
                </p>

                {/* Availability */}
                {doctor.availability && doctor.availability.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Available Days</p>
                        <div className="flex flex-wrap gap-1">
                            {doctor.availability.map((avail, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium capitalize"
                                >
                                    {avail.day.slice(0, 3)}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <Link href={`/doctors/${doctor._id}`}>
                    <Button className="w-full" disabled={doctor.status !== 'active'}>
                        {doctor.status === 'active' ? 'Book Appointment' : 'Not Available'}
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default DoctorCard;

