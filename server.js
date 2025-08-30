// ───────────────────────────────────────────────────────────
//  Universal Form Handler - Minimal Stable Version
// ───────────────────────────────────────────────────────────
require('dotenv').config();

const express     = require('express');
const nodemailer  = require('nodemailer');
const cors        = require('cors');
const helmet      = require('helmet');
const rateLimit   = require('express-rate-limit');
const multer      = require('multer');
const path        = require('path');

const app = express();

/* ── 1. BASIC SECURITY & CORS ──────────────────────────── */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"]
    }
  }
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
          ? process.env.ALLOWED_ORIGINS.split(',')
          : ['http://localhost:3000'],
  methods: ['GET','POST'],
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 min
  max     : 10,               // 10 req/IP
  message : { error:'Too many requests, please try again later.' }
});
app.use(['/submit-form', '/submit-form-files'], limiter);

/* ── 2. BODY PARSERS & STATIC ───────────────────────────── */
app.use(express.urlencoded({ extended:true, limit:'10mb' }));
app.use(express.json({ limit:'10mb' }));
app.use(express.static(path.join(__dirname,'public')));


/* ── 3. EMAIL TRANSPORT ────────────────────────────────── */
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth   : {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


/* ── 4. EMAIL TEMPLATE ─────────────────────────────────── */
const buildEmail = (data, src) => {
  const ts = new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'});
  
  const escapeHtml = (text) => {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', 'Segoe UI', sans-serif; background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%); padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #1e1e3f 0%, #2a2a5a 100%); border: 2px solid #FFD700; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.3); }
      .header { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; padding: 40px 30px; text-align: center; }
      .header .logo-icon { font-size: 65px; margin-bottom: 15px; display: block; }
      .header h1 { font-size: 28px; font-weight: 700; }
      .info-bar { background: rgba(255,215,0,0.1); border-top: 1px solid rgba(255,215,0,0.3); border-bottom: 1px solid rgba(255,215,0,0.3); padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; }
      .info-item { display: flex; align-items: center; color: #FFD700; font-weight: 600; }
      .info-item .emoji { margin-right: 8px; font-size: 18px; }
      .content { padding: 40px 30px; background: linear-gradient(145deg, #2a2a5a 0%, #1e1e3f 100%); }
      .field { margin-bottom: 20px; padding: 20px; background: rgba(255,215,0,0.05); border-radius: 12px; border-left: 5px solid #FFD700; border: 1px solid rgba(255,215,0,0.2); }
      .field-label { font-size: 12px; font-weight: 700; color: #FFD700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
      .field-value { font-size: 16px; color: #fff; line-height: 1.5; word-wrap: break-word; }
      .footer { background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%); color: #FFD700; padding: 30px; text-align: center; }
      .footer .brand { font-size: 18px; font-weight: 600; margin-bottom: 10px; }
      .footer .tagline { font-size: 14px; opacity: 0.8; color: #ccc; }
      @media (max-width: 600px) {
        .info-bar { flex-direction: column; gap: 10px; }
        .content { padding: 30px 20px; }
        .field { padding: 15px; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo-icon">🍁</div>
        <h1>New Message Received</h1>
      </div>
      <div class="info-bar">
        <div class="info-item">
          <span class="emoji">🌐</span>
          <span>Source: ${escapeHtml(src)}</span>
        </div>
        <div class="info-item">
          <span class="emoji">⏰</span>
          <span>${ts}</span>
        </div>
      </div>
      <div class="content">`;
  
  let text = `New Form Submission\nSource: ${src}\nTime: ${ts}\n\n`;

  for (const [k,v] of Object.entries(data))
    if (!['_honeypot','source'].includes(k)){
      html += `
        <div class="field">
          <div class="field-label">${escapeHtml(k)}</div>
          <div class="field-value">${escapeHtml(v)}</div>
        </div>`;
      text += `${k}: ${v}\n`;
    }
  
  html += `
      </div>
      <div class="footer">
        <div class="brand">Universe Form Handler</div>
        <div class="tagline">Created: By ➖ Rajesh Ranjan</div>
      </div>
    </div>
  </body>
  </html>`;

  return {html, text};
};

/* ── 5. FILE UPLOAD SETUP ──────────────────────────────── */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(pdf|doc|docx|jpg|jpeg|png)$/i;
    cb(null, allowed.test(file.originalname));
  }
});

/* ── 6. MAIN ROUTES ─────────────────────────────────────── */
app.post('/submit-form-files', upload.single('document'), async (req,res)=>{
  try{
    const data = req.body;
    const source = data.source || req.get('Referer') || 'Unknown';
    
    if (data._honeypot) return res.status(400).json({success:false,message:'Spam detected'});
    if (!Object.keys(data).length) return res.status(400).json({success:false,message:'No data received'});
    
    if (!process.env.EMAIL_USER || !process.env.RECIPIENT_EMAIL) {
      return res.json({success:true,message:'Form received! (Email configuration missing)'});
    }
    
    if (!process.env.EMAIL_PASS) {
      return res.json({success:true,message:'Form received! (Email password missing)'});
    }
    
    const {html,text} = buildEmail(data,source);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.RECIPIENT_EMAIL,
      subject: `New Form Submission from ${source}`,
      text, html
    };
    
    if (req.file) {
      mailOptions.attachments = [{
        filename: req.file.originalname,
        content: req.file.buffer
      }];
    }
    
    await transporter.sendMail(mailOptions);
    res.json({success:true,message:'✅ Form submitted successfully! Check your email.'});
  }
  catch(err){
    console.error('Email send error →',err.message);
    res.json({success:true,message:'Form received! (Email delivery failed)'});
  }
});

app.post('/submit-form', async (req,res)=>{
  try{
    const data   = req.body;
    const source = data.source || req.get('Referer') || 'Unknown';

    // Honeypot
    if (data._honeypot) return res.status(400).json({success:false,message:'Spam detected'});
    if (!Object.keys(data).length) return res.status(400).json({success:false,message:'No data received'});

    // Log form data
    console.log('Form data received:', data);

    // Validate environment variables
    if (!process.env.EMAIL_USER || !process.env.RECIPIENT_EMAIL) {
      console.log('⚠️  Missing EMAIL_USER or RECIPIENT_EMAIL');
      return res.json({success:true,message:'Form received! (Email configuration missing)'});
    }
    
    if (!process.env.EMAIL_PASS) {
      console.log('⚠️  Missing EMAIL_PASS');
      return res.json({success:true,message:'Form received! (Email password missing)'});
    }

    const {html,text} = buildEmail(data,source);
    await transporter.sendMail({
      from   : process.env.EMAIL_USER,
      to     : process.env.RECIPIENT_EMAIL,
      subject: `New Form Submission from ${source}`,
      text, html
    });

    res.json({success:true,message:'✅ Form submitted successfully! Check your email.'});
  }
  catch(err){
    console.error('Email send error →',err.message);
    res.json({success:true,message:'Form received! (Email delivery failed)'});
  }
});

/* ── 7. HEALTH & HOME ──────────────────────────────────── */
app.get('/health', (_req,res)=> res.json({status:'OK',time:Date.now()}));

app.get('/', (_req,res)=>{
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ── 8. START ──────────────────────────────────────────── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`✅ Server listening on http://localhost:${PORT}`));