'use client';

import { useState, useEffect } from 'react';
import DoctorCard from './DoctorCard';
import { getDoctors } from '@/services/doctorService';

const DoctorList = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [specialty, setSpecialty] = useState('');

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (specialty) params.specialty = specialty;

            const response = await getDoctors(params);
            if (response.success) {
                setDoctors(response.data);
            }
        } catch (err) {
            setError(err.message || 'Failed to load doctors');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchDoctors();
    };

    // Get unique specialties for filter
    const specialties = [...new Set(doctors.map(d => d.specialty))];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                        <div className="h-48 bg-gray-200 rounded-xl mb-4" />
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                        <div className="h-20 bg-gray-200 rounded mb-4" />
                        <div className="h-10 bg-gray-200 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <p className="text-gray-600">{error}</p>
            </div>
        );
    }

    return (
        <div>
            {/* Search & Filter */}
            <form onSubmit={handleSearch} className="mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search doctors by name or specialty..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Specialties</option>
                        {specialties.map((spec) => (
                            <option key={spec} value={spec}>{spec}</option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                    >
                        Search
                    </button>
                </div>
            </form>

            {/* Results */}
            {doctors.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-500">No doctors found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.map((doctor) => (
                        <DoctorCard key={doctor._id} doctor={doctor} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DoctorList;
