import nodemailer from 'nodemailer';

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.USER_EMAIL_ADDRESS,
        pass: process.env.USER_EMAIL_ADDRESS_PASSWORD,
    }
})

export default transporter;
