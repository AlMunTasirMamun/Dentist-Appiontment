const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const Appointment = require('../server/src/models/Appointment');
const Doctor = require('../server/src/models/Doctor');
const User = require('../server/src/models/User');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const doctors = await Doctor.find();
        console.log('\nDoctors:');
        doctors.forEach(d => console.log(`- ${d.name} (_id: ${d._id}, user: ${d.user})`));

        const appointments = await Appointment.find();
        console.log('\nAppointments:');
        appointments.forEach(a => console.log(`- ID: ${a._id}, Doctor: ${a.doctor}, Status: ${a.status}`));

        const users = await User.find({ role: 'doctor' });
        console.log('\nDoctor Users:');
        users.forEach(u => console.log(`- ${u.name} (_id: ${u._id})`));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
