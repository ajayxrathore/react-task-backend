import nodemailer from 'nodemailer';

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USER_EMAIL_ADDRESS,
        pass: process.env.USER_EMAIL_ADDRESS_PASSWORD,
    }
})

export default transporter;
