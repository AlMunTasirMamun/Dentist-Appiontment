const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected to MongoDB');
    
    const RefundRequest = require('./src/models/RefundRequest');
    const Appointment = require('./src/models/Appointment');
    
    // Check refund requests
    const refundRequests = await RefundRequest.find({});
    console.log('\n=== REFUND REQUESTS ===');
    console.log('Total refund requests:', refundRequests.length);
    if (refundRequests.length > 0) {
        console.log(JSON.stringify(refundRequests, null, 2));
    }
    
    // Check cancelled paid appointments
    const cancelledPaidAppointments = await Appointment.find({
        status: 'cancelled',
        paymentStatus: 'paid'
    });
    console.log('\n=== CANCELLED PAID APPOINTMENTS ===');
    console.log('Total cancelled paid appointments:', cancelledPaidAppointments.length);
    if (cancelledPaidAppointments.length > 0) {
        cancelledPaidAppointments.forEach(apt => {
            console.log(`- ID: ${apt._id}, Amount: ${apt.amount}, RefundStatus: ${apt.refundStatus}`);
        });
    }
    
    mongoose.disconnect();
    console.log('\nDone');
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
