const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');

async function check() {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const users = await User.find();
        console.log('\n--- All Users ---');
        for (const u of users) {
            console.log(`User Name: ${u.name} | Email: ${u.email} | Role: ${u.role} | _id: ${u._id}`);
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
