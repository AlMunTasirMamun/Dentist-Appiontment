const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Prescription = require('./models/Prescription');
const User = require('./models/User');

async function check() {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const prescriptions = await Prescription.find();
        console.log('\n--- Prescriptions ---');
        for (const p of prescriptions) {
            console.log(`Prescription ID: ${p._id}`);
            console.log(`  Patient ID: ${p.patient}`);
            console.log(`  Diagnosis: ${p.diagnosis}`);
            if (p.patient) {
                const user = await User.findById(p.patient);
                console.log(`  Patient Name: ${user ? user.name : 'NOT FOUND'}`);
            } else {
                console.log(`  Patient: GUEST`);
            }
            console.log('----------------');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
