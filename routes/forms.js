const express = require('express');
const multer = require('multer');
const path = require('path');
const { submitForm } = require('../controllers/formController');

const router = express.Router();

// File upload configuration
const storage = multer.diskStorage({
    destination: 'uploads/temp/',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'jpeg,jpg,png,pdf').split(',');
        const fileExt = path.extname(file.originalname).toLowerCase().slice(1);
        
        if (allowedTypes.includes(fileExt)) {
            cb(null, true);
        } else {
            cb(new Error(`File type .${fileExt} not allowed`));
        }
    }
});

// Main form submission route
router.post('/submit-form', submitForm);

// Form with file uploads
router.post('/submit-form-files', upload.array('files', 5), submitForm);

// Health check
router.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Home page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = router;
