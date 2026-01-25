const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Doctor = require('./models/Doctor');
const User = require('./models/User');

async function check() {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const doctors = await Doctor.find();
        console.log('\n--- Doctors Record ---');
        for (const d of doctors) {
            console.log(`Doctor Name: ${d.name} | _id: ${d._id} | userLink: ${d.user}`);
        }

        const users = await User.find({ role: 'doctor' });
        console.log('\n--- Users with role "doctor" ---');
        for (const u of users) {
            const doc = await Doctor.findOne({ user: u._id });
            console.log(`User Name: ${u.name} | Email: ${u.email} | _id: ${u._id} | linkedDoctor: ${doc ? doc._id : 'NONE'}`);
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
