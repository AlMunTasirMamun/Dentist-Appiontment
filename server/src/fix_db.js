const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Doctor = require('./models/Doctor');
const User = require('./models/User');

async function fix() {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const user = await User.findOne({ email: 'doctor@gmail.com', role: 'doctor' });
        if (!user) {
            console.log('User doctor@gmail.com not found');
            process.exit(1);
        }

        console.log(`Found User: ${user.name} (${user._id})`);

        // Try to find a doctor without a user link
        let doctor = await Doctor.findOne({ user: { $exists: false } });
        if (!doctor) {
            doctor = await Doctor.findOne({ user: null });
        }

        if (doctor) {
            console.log(`Found unlinked Doctor: ${doctor.name} (${doctor._id})`);
            doctor.user = user._id;
            await doctor.save();
            console.log('Successfully linked doctor to user.');
        } else {
            console.log('No unlinked doctor found. Creating a new profile for this user.');
            await Doctor.create({
                user: user._id,
                name: user.name,
                email: user.email,
                specialty: 'General Dentist',
                bio: 'Auto-generated profile',
                availability: [],
                price: 1000
            });
            console.log('Created new doctor profile.');
        }

        process.exit();
    } catch (err) {
        console.error('Error in fix script:', err.message);
        process.exit(1);
    }
}

fix();
