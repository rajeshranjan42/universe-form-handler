const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransporter({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

const sendEmail = async (mailOptions) => {
    try {
        const transporter = createTransporter();
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email error:', error);
        throw error;
    }
};

module.exports = { createTransporter, sendEmail };
