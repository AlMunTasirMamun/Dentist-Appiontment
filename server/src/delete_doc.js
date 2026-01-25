const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Doctor = require('./models/Doctor');

async function fix() {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const result = await Doctor.deleteOne({ name: 'doc', user: { $exists: false } });
        console.log('Deleted orphaned doctor "doc":', result.deletedCount);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fix();
