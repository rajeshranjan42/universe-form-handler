const { sendEmail } = require('../config/email');
const { generateEmailTemplate } = require('../utils/emailTemplate');
const Submission = require('../models/Submission');

const submitForm = async (req, res) => {
    try {
        const formData = req.body;
        const source = formData.source || req.get('Referer') || 'Unknown';
        const clientIP = req.ip || req.connection.remoteAddress;

        // Honeypot spam protection
        if (formData._honeypot) {
            return res.status(400).json({ 
                success: false, 
                message: 'Spam detected' 
            });
        }

        // Validation
        if (!formData || Object.keys(formData).length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No data received' 
            });
        }

        // Generate email content
        const emailContent = generateEmailTemplate(formData, source);

        // Prepare email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.RECIPIENT_EMAIL,
            subject: `New Form Submission from ${source}`,
            text: emailContent.text,
            html: emailContent.html
        };

        // Send email
        await sendEmail(mailOptions);

        // Save to database (if enabled)
        if (process.env.MONGODB_URI) {
            await new Submission({
                data: formData,
                source,
                ip: clientIP,
                userAgent: req.get('User-Agent')
            }).save();
        }

        res.json({ 
            success: true, 
            message: 'Form submitted successfully!',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Form submission error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error occurred' 
        });
    }
};

module.exports = { submitForm };
