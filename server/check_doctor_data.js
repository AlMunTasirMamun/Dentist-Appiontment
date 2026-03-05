const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected to MongoDB');
    
    // Load all models in correct order
    const User = require('./src/models/User');
    const Doctor = require('./src/models/Doctor');
    const Appointment = require('./src/models/Appointment');
    const RefundRequest = require('./src/models/RefundRequest');
    
    // Get a refund request with populated appointment and doctor
    const request = await RefundRequest.findOne({})
        .populate({
            path: 'appointment',
            populate: { path: 'doctor', select: 'name specialty' }
        });
    
    console.log('\n=== REFUND REQUEST ===');
    console.log('Request ID:', request?._id);
    console.log('\n=== APPOINTMENT ===');
    console.log('Appointment ID:', request?.appointment?._id);
    console.log('Appointment Doctor ID:', request?.appointment?.doctor);
    
    if (request?.appointment?.doctor) {
        console.log('\n=== DOCTOR ===');
        console.log('Doctor Name:', request.appointment.doctor.name);
        console.log('Doctor Specialty:', request.appointment.doctor.specialty);
        console.log('Full Doctor Object:', JSON.stringify(request.appointment.doctor, null, 2));
    } else {
        console.log('\nDoctor not populated or null');
    }
    
    mongoose.disconnect();
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
