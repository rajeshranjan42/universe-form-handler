# 🌐 Universal Form Handler - External Usage Guide

## 📋 Quick Setup for External Projects

### 1. Basic HTML Form
```html
<form id="contactForm">
    <input type="text" name="name" placeholder="Your Name" required>
    <input type="email" name="email" placeholder="Your Email" required>
    <textarea name="message" placeholder="Your Message" required></textarea>
    
    <!-- Required fields -->
    <input type="hidden" name="_honeypot" value="">
    <input type="hidden" name="source" value="My Website Contact Form">
    
    <button type="submit">Send Message</button>
</form>
```

### 2. JavaScript Code
```javascript
document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch('https://universe-form-handler.onrender.com/submit-form', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Message sent successfully!');
            e.target.reset();
        } else {
            alert('❌ Error: ' + result.message);
        }
    } catch (error) {
        alert('❌ Network error: ' + error.message);
    }
});
```

### 3. Required Fields
- `_honeypot`: Must be empty (spam protection)
- `source`: Identify your form (e.g., "My Website Contact")

### 4. Optional Fields
- `name`, `email`, `message`, `phone`, `company`, `subject`, etc.
- Any field name works - they'll all be emailed

### 5. File Upload (Optional)
```html
<form id="contactForm" enctype="multipart/form-data">
    <!-- other fields -->
    <input type="file" name="document" accept=".pdf,.doc,.docx,.jpg,.png">
    <button type="submit">Send with File</button>
</form>
```

```javascript
// For file uploads, use FormData directly
const response = await fetch('https://universe-form-handler.onrender.com/submit-form-files', {
    method: 'POST',
    body: formData  // Don't stringify for file uploads
});
```

## 🔧 Troubleshooting

### CORS Errors
If you get CORS errors, the server needs to be redeployed with the latest CORS settings.

### Network Errors
- Check if the URL is correct: `https://universe-form-handler.onrender.com`
- Verify the server is running at `/health` endpoint

### No Email Received
- Check spam folder
- Verify Gmail App Password is configured on server
- Check server logs for errors

## 📧 Email Configuration
Emails are sent to: `officialrajeshranjan@gmail.com`

## 🚀 Live Demo
Test the form handler: [Test External Form](https://universe-form-handler.onrender.com/test-external.html)