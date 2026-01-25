const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Appointment = require('./models/Appointment');
const Doctor = require('./models/Doctor');
const User = require('./models/User');

async function check() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI not found in .env');

        await mongoose.connect(uri);
        console.log('Connected to DB');

        const doctors = await Doctor.find();
        console.log('\n--- Doctors ---');
        for (const d of doctors) {
            const user = await User.findById(d.user);
            console.log(`Doctor: ${d.name}`);
            console.log(`  _id: ${d._id}`);
            console.log(`  Linked User ID: ${d.user}`);
            console.log(`  Linked User Found: ${user ? 'YES (' + user.email + ')' : 'NO'}`);
            console.log('----------------');
        }

        const doctorUsers = await User.find({ role: 'doctor' });
        console.log('\n--- Users with Role "doctor" ---');
        for (const u of doctorUsers) {
            const doc = await Doctor.findOne({ user: u._id });
            console.log(`User: ${u.name} (${u.email})`);
            console.log(`  _id: ${u._id}`);
            console.log(`  Linked Doctor Record Found: ${doc ? 'YES (' + doc._id + ')' : 'NO'}`);
            console.log('----------------');
        }

        process.exit();
    } catch (err) {
        console.error('Error in check script:', err.message);
        process.exit(1);
    }
}

check();
